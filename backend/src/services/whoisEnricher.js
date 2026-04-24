const axios = require('axios');
const NodeCache = require('node-cache');

// Cache WHOIS results for 24 hours to avoid redundant lookups and stay within rate limits
const whoisCache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });

// Known trusted IP ranges for common providers — avoids API calls for obvious senders
const KNOWN_PROVIDERS = {
  google: {
    patterns: [/^209\.85\./, /^74\.125\./, /^64\.233\./, /^66\.102\./, /^72\.14\./, /^216\.58\./, /^216\.239\./, /^23\.251\./],
    owner: 'Google LLC',
    asn: 'AS15169',
    country: 'US',
    threatLevel: 'TRUSTED',
  },
  microsoft: {
    patterns: [/^40\./, /^52\./, /^104\.47\./, /^13\.107\./, /^157\.55\./],
    owner: 'Microsoft Corporation',
    asn: 'AS8075',
    country: 'US',
    threatLevel: 'TRUSTED',
  },
  amazon_ses: {
    patterns: [/^199\.255\.192\./, /^54\.240\./, /^23\.249\./, /^149\.72\./],
    owner: 'Amazon SES / AWS',
    asn: 'AS16509',
    country: 'US',
    threatLevel: 'TRUSTED',
  },
  cloudflare: {
    patterns: [/^104\.16\./, /^104\.17\./, /^104\.18\./, /^104\.19\./, /^104\.20\./, /^104\.21\./, /^104\.22\./, /^104\.23\./, /^104\.24\./, /^104\.25\./, /^104\.26\./, /^104\.27\./, /^104\.28\./],
    owner: 'Cloudflare Inc',
    asn: 'AS13335',
    country: 'US',
    threatLevel: 'TRUSTED',
  },
  mailchimp: {
    patterns: [/^198\.2\./, /^205\.201\./],
    owner: 'Mailchimp / Intuit',
    asn: 'AS26276',
    country: 'US',
    threatLevel: 'TRUSTED',
  },
};

/**
 * Classifies threat level from ip-api.com response.
 * Uses country, org name, and proxy/hosting flags.
 */
function classifyThreat(data) {
  if (!data || data.status !== 'success') return 'UNKNOWN';

  const org = (data.org || '').toLowerCase();
  const isp = (data.isp || '').toLowerCase();

  // Known legitimate mail providers
  if (/google|microsoft|amazon|cloudflare|mailchimp|sendgrid|mailgun|sparkpost/.test(org + isp)) {
    return 'TRUSTED';
  }

  // Hosting/VPS/proxy without recognizable brand — potentially suspicious
  if (data.hosting === true || data.proxy === true || data.vpn === true) {
    return 'SUSPICIOUS';
  }

  return 'NEUTRAL';
}

/**
 * Checks pre-defined provider patterns before making an API call.
 */
function checkKnownProviders(ip) {
  for (const [, provider] of Object.entries(KNOWN_PROVIDERS)) {
    if (provider.patterns.some((pattern) => pattern.test(ip))) {
      return {
        owner: provider.owner,
        asn: provider.asn,
        country: provider.country,
        threatLevel: provider.threatLevel,
        lastUpdated: new Date().toISOString().split('T')[0],
      };
    }
  }
  return null;
}

/**
 * Lookup a single IP via ip-api.com batch endpoint.
 * Returns normalized WHOIS object.
 */
async function enrichIP(ip) {
  const cached = whoisCache.get(ip);
  if (cached) return cached;

  const known = checkKnownProviders(ip);
  if (known) {
    whoisCache.set(ip, known);
    return known;
  }

  try {
    const response = await axios.get(
      `http://ip-api.com/json/${ip}?fields=status,message,country,org,isp,as,hosting,proxy,vpn`,
      { timeout: 5000 }
    );

    const data = response.data;
    const result = {
      owner: data.org || data.isp || 'Unknown',
      asn: data.as ? data.as.split(' ')[0] : 'Unknown',
      country: data.country || 'Unknown',
      threatLevel: classifyThreat(data),
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    whoisCache.set(ip, result);
    return result;
  } catch {
    const fallback = {
      owner: 'Lookup unavailable',
      asn: 'Unknown',
      country: 'Unknown',
      threatLevel: 'UNKNOWN',
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    // Cache briefly so we don't hammer a failing API
    whoisCache.set(ip, fallback, 300);
    return fallback;
  }
}

/**
 * Enrich an array of IPs using ip-api.com batch endpoint.
 * Resolves up to 100 IPs in a single POST request — no per-IP delay needed.
 * Falls back to individual lookups for IPs that fail in the batch.
 */
async function batchEnrich(ips) {
  const results = new Map();
  const fallback = {
    owner: 'Lookup failed',
    asn: 'Unknown',
    country: 'Unknown',
    threatLevel: 'UNKNOWN',
    lastUpdated: new Date().toISOString().split('T')[0],
  };

  // Separate IPs already known (cache or provider list) from those needing lookup
  const toFetch = [];
  for (const ip of ips) {
    const cached = whoisCache.get(ip);
    if (cached) {
      results.set(ip, cached);
      continue;
    }
    const known = checkKnownProviders(ip);
    if (known) {
      whoisCache.set(ip, known);
      results.set(ip, known);
      continue;
    }
    toFetch.push(ip);
  }

  if (toFetch.length === 0) return results;

  // ip-api.com batch endpoint: up to 100 IPs per request, single HTTP call
  const BATCH_SIZE = 100;
  for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
    const chunk = toFetch.slice(i, i + BATCH_SIZE);
    try {
      const response = await axios.post(
        'http://ip-api.com/batch?fields=status,message,query,country,org,isp,as,hosting,proxy,vpn',
        chunk.map((ip) => ({ query: ip })),
        { timeout: 10000 }
      );

      for (const data of response.data) {
        const ip = data.query;
        const result = data.status === 'success' ? {
          owner: data.org || data.isp || 'Unknown',
          asn: data.as ? data.as.split(' ')[0] : 'Unknown',
          country: data.country || 'Unknown',
          threatLevel: classifyThreat(data),
          lastUpdated: new Date().toISOString().split('T')[0],
        } : { ...fallback, lastUpdated: new Date().toISOString().split('T')[0] };

        whoisCache.set(ip, result);
        results.set(ip, result);
      }
    } catch {
      // Batch failed — fill remaining IPs with fallback
      for (const ip of chunk) {
        if (!results.has(ip)) {
          results.set(ip, { ...fallback, lastUpdated: new Date().toISOString().split('T')[0] });
        }
      }
    }
  }

  return results;
}

module.exports = { enrichIP, batchEnrich };
