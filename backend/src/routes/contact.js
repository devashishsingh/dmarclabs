const express = require('express');
const { addContact } = require('../services/contactStore');

const router = express.Router();

const VALID_SUBJECTS = new Set(['bug', 'feature', 'access', 'privacy', 'general', 'other']);

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>]/g, '').trim().slice(0, 2000);
}

router.post('/', (req, res, next) => {
  try {
    const { name, subject, message } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      return res.status(400).json({ error: 'VALIDATION', message: 'name is required' });
    }
    if (!subject || !VALID_SUBJECTS.has(subject)) {
      return res.status(400).json({ error: 'VALIDATION', message: 'invalid subject' });
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return res.status(400).json({ error: 'VALIDATION', message: 'message must be at least 10 characters' });
    }

    addContact({ name: sanitize(name), subject, message: sanitize(message) });

    return res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
