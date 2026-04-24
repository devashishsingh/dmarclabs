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
  // Key by IP, using x-forwarded-for for Fly.io proxy
  keyGenerator: (req) => req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip,
});

module.exports = rateLimiter;
