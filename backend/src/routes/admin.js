const express = require('express');
const { timingSafeEqual } = require('crypto');
const { getAllFeedback, getSummary } = require('../services/feedbackStore');
const { getAllContacts, getUnreadCount, markRead } = require('../services/contactStore');
const { getStats } = require('../services/statsStore');
const config = require('../config/env');

const router = express.Router();

/**
 * Constant-time token comparison to prevent timing-based token enumeration.
 * Pads both buffers to the same length before comparing.
 */
function safeTokenEqual(a, b) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    // Run dummy comparison to keep timing uniform, then reject
    timingSafeEqual(Buffer.alloc(aBuf.length), Buffer.alloc(aBuf.length));
    return false;
  }
  return timingSafeEqual(aBuf, bBuf);
}

function requireAdminToken(req, res, next) {
  if (!config.adminToken) {
    return res.status(503).json({ error: 'ADMIN_DISABLED', message: 'Admin access is not configured' });
  }
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token || !safeTokenEqual(token, config.adminToken)) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid or missing admin token' });
  }
  next();
}

// GET /api/admin/stats
router.get('/stats', requireAdminToken, (req, res) => {
  return res.status(200).json(getStats());
});

// GET /api/admin/feedback
router.get('/feedback', requireAdminToken, (req, res) => {
  const summary = getSummary();
  const entries = getAllFeedback();
  return res.status(200).json({ summary, entries });
});

// GET /api/admin/contact
router.get('/contact', requireAdminToken, (req, res) => {
  const entries = getAllContacts();
  const unread = getUnreadCount();
  return res.status(200).json({ unread, total: entries.length, entries });
});

// PATCH /api/admin/contact/:id/read
router.patch('/contact/:id/read', requireAdminToken, (req, res) => {
  const found = markRead(req.params.id);
  if (!found) return res.status(404).json({ error: 'NOT_FOUND' });
  return res.status(200).json({ success: true });
});

module.exports = router;
