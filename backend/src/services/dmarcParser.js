const xml2js = require('xml2js');
const { Readable } = require('stream');
const path = require('path');

/**
 * Parses a DMARC aggregate XML report (rua) from a file path or buffer.
 * Only plain .xml files are accepted.
 * Returns an array of enriched record objects ready for WHOIS lookup.
 */
async function parseDMARCXML(input) {
  let rawBuf;

  if (typeof input === 'string') {
    const fs = require('fs');
    const ext = path.extname(input).toLowerCase();
    if (ext !== '.xml') {
      throw new Error(`Unsupported file type "${ext}". Only .xml DMARC reports are accepted.`);
    }
    rawBuf = await streamToBuffer(fs.createReadStream(input));
  } else if (Buffer.isBuffer(input)) {
    rawBuf = input;
  } else {
    throw new Error('Invalid input: expected file path or Buffer');
  }

  const parser = new xml2js.Parser({
    explicitArray: true,
    trim: true,
    normalize: true,
  });

  let parsed;
  try {
    parsed = await parser.parseStringPromise(rawBuf.toString('utf8'));
  } catch (err) {
    throw new Error(`XML syntax error: ${err.message}`);
  }

  return extractRecords(parsed);
}

/**
 * Reads a readable stream into a single Buffer.
 */
function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

/**
 * Extracts per-IP metrics from parsed DMARC XML object.
 * Handles both single and multiple <record> elements.
 */
function extractRecords(parsed) {
  const feedback = parsed.feedback;
  if (!feedback) throw new Error('Invalid DMARC report: missing <feedback> root element');

  const rawRecords = feedback.record;
  if (!rawRecords || rawRecords.length === 0) {
    return [];
  }

  // Aggregate by IP (a report may have multiple records for the same IP)
  const ipMap = new Map();

  for (const record of rawRecords) {
    const row = record.row && record.row[0];
    const identifiers = record.identifiers && record.identifiers[0];
    const authResults = record.auth_results && record.auth_results[0];

    if (!row) continue;

    const ip = safeText(row.source_ip);
    if (!ip || !isValidIP(ip)) continue;

    const count = parseInt(safeText(row.count), 10) || 0;
    const policyEvaluated = row.policy_evaluated && row.policy_evaluated[0];

    const dmarcDisposition = safeText(policyEvaluated && policyEvaluated.disposition);
    const dmarcDkim = safeText(policyEvaluated && policyEvaluated.dkim);
    const dmarcSpf = safeText(policyEvaluated && policyEvaluated.spf);

    // DMARC pass = both evaluated results considered, disposition matters
    const dmarcPass = dmarcDkim === 'pass' || dmarcSpf === 'pass' ? count : 0;
    const dmarcFail = dmarcDkim !== 'pass' && dmarcSpf !== 'pass' ? count : 0;

    // SPF alignment result from policy_evaluated (alignment-aware)
    const spfAligned = dmarcSpf === 'pass' ? count : 0;
    // DKIM alignment result from policy_evaluated (alignment-aware)
    const dkimAligned = dmarcDkim === 'pass' ? count : 0;

    // SPF raw auth result from auth_results
    const spfResults = (authResults && authResults.spf) || [];
    const spfHasPass = spfResults.some((s) => safeText(s.result) === 'pass');
    const spfPass = spfHasPass ? count : 0;
    const spfFail = spfHasPass ? 0 : count; // mutually exclusive with pass

    // DKIM raw auth result from auth_results
    const dkimResults = (authResults && authResults.dkim) || [];
    const dkimHasPass = dkimResults.some((d) => safeText(d.result) === 'pass');
    const dkimPass = dkimHasPass ? count : 0;
    const dkimFail = dkimHasPass ? 0 : count; // mutually exclusive with pass

    if (ipMap.has(ip)) {
      const existing = ipMap.get(ip);
      existing.emailVolume += count;
      existing.dmarc.pass += dmarcPass;
      existing.dmarc.fail += dmarcFail;
      existing.spf.pass += spfPass;
      existing.spf.fail += spfFail;
      existing.spf.aligned += spfAligned;
      existing.dkim.pass += dkimPass;
      existing.dkim.fail += dkimFail;
      existing.dkim.aligned += dkimAligned;
    } else {
      ipMap.set(ip, {
        ip,
        emailVolume: count,
        dmarc: { pass: dmarcPass, fail: dmarcFail },
        spf: { pass: spfPass, fail: spfFail, aligned: spfAligned },
        dkim: { pass: dkimPass, fail: dkimFail, aligned: dkimAligned },
      });
    }
  }

  // Compute pass rates
  const records = [];
  for (const [, entry] of ipMap) {
    const total = entry.emailVolume || 1;
    entry.dmarc.passRate = formatPassRate(entry.dmarc.pass, total);
    entry.spf.passRate = formatPassRate(entry.spf.pass, total);
    entry.spf.alignedRate = formatPassRate(entry.spf.aligned, total);
    entry.dkim.passRate = formatPassRate(entry.dkim.pass, total);
    entry.dkim.alignedRate = formatPassRate(entry.dkim.aligned, total);
    records.push(entry);
  }

  // Sort by email volume descending
  return records.sort((a, b) => b.emailVolume - a.emailVolume);
}

function safeText(val) {
  if (!val) return '';
  if (Array.isArray(val)) return val[0] || '';
  return String(val);
}

/**
 * Validates that a string is a well-formed IPv4 or IPv6 address.
 * Rejects any non-IP value to prevent SSRF via crafted DMARC XML.
 */
function isValidIP(ip) {
  // IPv4: four dot-separated octets 0-255
  const ipv4Re = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const m = ipv4Re.exec(ip);
  if (m) {
    return m.slice(1).every((o) => parseInt(o, 10) <= 255);
  }
  // IPv6: colon-hex notation (handles full, compressed, and IPv4-mapped forms)
  const ipv6Re = /^[0-9a-fA-F:]{2,39}$/;
  return ipv6Re.test(ip) && ip.includes(':');
}

function formatPassRate(pass, total) {
  return `${((pass / total) * 100).toFixed(2)}%`;
}

/**
 * Compute summary stats from parsed records.
 */
function computeSummary(records, processingTimeMs) {
  const totalEmails = records.reduce((sum, r) => sum + r.emailVolume, 0);
  const totalPassEmails = records.reduce((sum, r) => sum + r.dmarc.pass, 0);
  const dmarcPassRate = totalEmails > 0
    ? `${((totalPassEmails / totalEmails) * 100).toFixed(2)}%`
    : '0.00%';

  return {
    totalEmails,
    dmarcPassRate,
    totalIPs: records.length,
    processingTime: `${(processingTimeMs / 1000).toFixed(1)}s`,
  };
}

module.exports = { parseDMARCXML, computeSummary };
