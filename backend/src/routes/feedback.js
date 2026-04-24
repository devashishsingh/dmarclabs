const express = require('express');
const { addFeedback } = require('../services/feedbackStore');

const router = express.Router();

const VALID_SENTIMENTS = new Set(['positive', 'neutral', 'negative']);

router.post('/', (req, res, next) => {
  try {
    const { sentiment, message } = req.body;

    if (!sentiment || !VALID_SENTIMENTS.has(sentiment)) {
      return res.status(400).json({
        error: 'VALIDATION',
        message: 'sentiment must be one of: positive, neutral, negative',
      });
    }

    if (message !== undefined && (typeof message !== 'string' || message.length > 2000)) {
      return res.status(400).json({
        error: 'VALIDATION',
        message: 'message must be a string of at most 2000 characters',
      });
    }

    addFeedback({ sentiment, message });

    return res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
