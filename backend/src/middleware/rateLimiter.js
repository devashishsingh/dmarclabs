const rateLimit = require('express-rate-limit');
const config = require('../config/env');

const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: config.rateLimit,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'RATE_LIMITED',
    message: `Too many requests. Limit: ${config.rateLimit} per minute.`,
  },
  // Use req.ip which is correctly set by Express with trust proxy:1
  // Never read x-forwarded-for directly — it can be spoofed by clients
  keyGenerator: (req) => req.ip || req.socket.remoteAddress || 'unknown',
});

module.exports = rateLimiter;
