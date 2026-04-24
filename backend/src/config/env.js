require('dotenv').config();

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 8080,
  resendApiKey: process.env.RESEND_API_KEY || '',
  moderatorEmail: process.env.MODERATOR_EMAIL || 'devashish.singh12@gmail.com',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 200,
  sessionTTL: parseInt(process.env.SESSION_TTL, 10) || 1800000, // 30 min
  rateLimit: parseInt(process.env.RATE_LIMIT, 10) || 10,
};

if (!config.resendApiKey && config.nodeEnv === 'production') {
  throw new Error('RESEND_API_KEY is required in production');
}

module.exports = config;
