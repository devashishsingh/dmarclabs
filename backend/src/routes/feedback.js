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

    addFeedback({ sentiment, message });

    return res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
