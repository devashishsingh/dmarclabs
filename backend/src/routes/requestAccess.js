const express = require('express');
const { sendAccessRequest, sendAccessConfirmation } = require('../services/emailService');
const config = require('../config/env');

const router = express.Router();

// Basic email regex — enough for format validation at this boundary
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/', async (req, res, next) => {
  try {
    const { name, email, organization, fileSize, useCase } = req.body;

    // Input validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'VALIDATION', message: 'Name is required (min 2 chars)' });
    }
    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'VALIDATION', message: 'A valid email address is required' });
    }
    if (!organization || typeof organization !== 'string' || organization.trim().length < 2) {
      return res.status(400).json({ error: 'VALIDATION', message: 'Organization is required' });
    }
    const parsedSize = parseInt(fileSize, 10);
    if (!parsedSize || parsedSize <= 0 || parsedSize > 100000) {
      return res.status(400).json({ error: 'VALIDATION', message: 'File size must be a positive number (MB)' });
    }
    if (!useCase || typeof useCase !== 'string' || useCase.trim().length < 10) {
      return res.status(400).json({ error: 'VALIDATION', message: 'Please describe your use case (min 10 chars)' });
    }

    const sanitized = {
      name: name.trim().slice(0, 100),
      email: email.trim().toLowerCase().slice(0, 254),
      organization: organization.trim().slice(0, 200),
      fileSize: parsedSize,
      useCase: useCase.trim().slice(0, 1000),
    };

    // Send notifications (parallel, non-blocking to user response)
    if (config.resendApiKey) {
      await Promise.allSettled([
        sendAccessRequest(sanitized),
        sendAccessConfirmation(sanitized),
      ]);
    }

    return res.status(200).json({
      success: true,
      message: 'Request received. Check your email for confirmation.',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
