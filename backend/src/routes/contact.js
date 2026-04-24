const express = require('express');

const router = express.Router();

const VALID_SUBJECTS = new Set(['bug', 'feature', 'access', 'privacy', 'general', 'other']);

// Basic sanitizer — strip control chars / HTML
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>]/g, '').trim().slice(0, 2000);
}

router.post('/', (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    // Input validation
    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      return res.status(400).json({ error: 'VALIDATION', message: 'name is required' });
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'VALIDATION', message: 'valid email is required' });
    }
    if (!subject || !VALID_SUBJECTS.has(subject)) {
      return res.status(400).json({ error: 'VALIDATION', message: 'invalid subject' });
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return res.status(400).json({ error: 'VALIDATION', message: 'message must be at least 10 characters' });
    }

    const safeName = sanitize(name);
    const safeMessage = sanitize(message);

    // In production, send via Resend or similar
    // Log intentionally minimal — no email addresses persisted
    process.stdout.write(
      `[contact] subject=${subject} hasEmail=true ts=${new Date().toISOString()} name="${safeName}" msg_len=${safeMessage.length}\n`
    );

    // TODO: swap to Resend when RESEND_API_KEY is live
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({ from: 'no-reply@dmarcl.dev', to: process.env.MODERATOR_EMAIL, ... });

    return res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
