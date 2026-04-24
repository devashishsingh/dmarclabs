const express = require('express');

const router = express.Router();

const VALID_SENTIMENTS = new Set(['positive', 'neutral', 'negative']);

router.post('/', (req, res, next) => {
  try {
    const { sentiment, message, sessionId } = req.body;

    if (!sentiment || !VALID_SENTIMENTS.has(sentiment)) {
      return res.status(400).json({
        error: 'VALIDATION',
        message: 'sentiment must be one of: positive, neutral, negative',
      });
    }

    // Anonymized logging only — no PII, no session data
    const log = {
      sentiment,
      hasMessage: !!(message && message.trim().length > 0),
      timestamp: new Date().toISOString(),
    };

    // In production, forward to analytics/Resend/Slack if needed
    // For now, intentionally no storage per privacy policy
    void log;

    return res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
