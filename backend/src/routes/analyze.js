const express = require('express');
const fs = require('fs');
const path = require('path');
const { getSession, storeResults, sessionExists } = require('../services/sessionManager');
const { parseDMARCXML, computeSummary } = require('../services/dmarcParser');
const { batchEnrich } = require('../services/whoisEnricher');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'MISSING_SESSION', message: 'sessionId is required' });
    }

    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'SESSION_NOT_FOUND', message: 'Session not found or expired' });
    }

    // If already analyzed, return cached results immediately
    if (session.status === 'complete' && session.results) {
      return res.status(200).json({
        sessionId,
        summary: session.summary,
        results: session.results,
        expiresAt: session.expiresAt,
      });
    }

    if (!fs.existsSync(session.filePath)) {
      return res.status(410).json({ error: 'FILE_EXPIRED', message: 'Uploaded file no longer exists' });
    }

    const startTime = Date.now();

    // Step 1: Parse the XML file
    let records;
    try {
      records = await parseDMARCXML(session.filePath);
    } catch (parseErr) {
      return res.status(422).json({
        error: 'PARSE_FAILED',
        message: `Could not parse DMARC XML: ${parseErr.message}`,
      });
    }

    if (records.length === 0) {
      return res.status(422).json({
        error: 'NO_RECORDS',
        message: 'The DMARC report contained no IP records',
      });
    }

    // Step 2: Enrich IPs with WHOIS data in parallel
    const uniqueIPs = [...new Set(records.map((r) => r.ip))];
    const whoisMap = await batchEnrich(uniqueIPs);

    // Step 3: Merge WHOIS data into records
    const enrichedRecords = records.map((record) => ({
      ...record,
      whois: whoisMap.get(record.ip) || {
        owner: 'Unknown',
        asn: 'Unknown',
        country: 'Unknown',
        threatLevel: 'UNKNOWN',
        lastUpdated: new Date().toISOString().split('T')[0],
      },
    }));

    const processingTime = Date.now() - startTime;
    const summary = computeSummary(enrichedRecords, processingTime);

    // Step 4: Persist to session and clean up temp file
    const stored = storeResults(sessionId, summary, enrichedRecords);

    // Delete the upload from disk — privacy guarantee
    try {
      fs.unlinkSync(session.filePath);
    } catch {
      // Non-fatal: OS temp dir will clean up eventually
    }

    return res.status(200).json({
      sessionId,
      summary: stored.summary,
      results: stored.results,
      expiresAt: stored.expiresAt,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
