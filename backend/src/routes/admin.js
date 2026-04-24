const express = require('express');
const { getAllFeedback, getSummary } = require('../services/feedbackStore');
const config = require('../config/env');

const router = express.Router();

function requireAdminToken(req, res, next) {
  if (!config.adminToken) {
    return res.status(503).json({ error: 'ADMIN_DISABLED', message: 'Admin access is not configured' });
  }
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token || token !== config.adminToken) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid or missing admin token' });
  }
  next();
}

// GET /api/admin/feedback
router.get('/feedback', requireAdminToken, (req, res) => {
  const summary = getSummary();
  const entries = getAllFeedback();
  return res.status(200).json({ summary, entries });
});

module.exports = router;
