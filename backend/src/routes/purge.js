const express = require('express');
const fs = require('fs');
const { getSession, purgeSession } = require('../services/sessionManager');

const router = express.Router();

router.post('/', (req, res, next) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'MISSING_SESSION', message: 'sessionId is required' });
    }

    const session = getSession(sessionId);

    // Attempt to remove the temp file if it still exists
    if (session && session.filePath) {
      try {
        if (fs.existsSync(session.filePath)) {
          fs.unlinkSync(session.filePath);
        }
      } catch {
        // Non-fatal
      }
    }

    const wasRemoved = purgeSession(sessionId);

    return res.status(200).json({
      success: true,
      message: wasRemoved ? 'Session purged successfully' : 'Session already expired or not found',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
