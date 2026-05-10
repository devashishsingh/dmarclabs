const express = require('express');
const helmet = require('helmet');
const config = require('./config/env');
const corsMiddleware = require('./middleware/cors');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const uploadRouter = require('./routes/upload');
const analyzeRouter = require('./routes/analyze');
const purgeRouter = require('./routes/purge');
const requestAccessRouter = require('./routes/requestAccess');
const feedbackRouter = require('./routes/feedback');
const contactRouter = require('./routes/contact');
const adminRouter = require('./routes/admin');

const app = express();

// --- Security Headers ---
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// --- CORS ---
app.use(corsMiddleware);

// --- Force UTF-8 charset on all responses (prevents emoji/Unicode mojibake) ---
app.use((req, res, next) => {
  res.charset = 'utf-8';
  next();
});

// --- Trust proxy for Fly.io ---
app.set('trust proxy', 1);

// --- Body parsing ---
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// --- Rate limiting (applied to all API routes) ---
app.use('/api', rateLimiter);

// --- API Routes ---
app.use('/api/upload', uploadRouter);
app.use('/api/analyze', analyzeRouter);
app.use('/api/purge', purgeRouter);
app.use('/api/request-access', requestAccessRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/contact', contactRouter);
app.use('/api/admin', adminRouter);

// --- Health check (Fly.io / uptime monitors) ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- 404 catch-all ---
app.use((req, res) => {
  res.status(404).json({ error: 'NOT_FOUND', message: 'Route not found' });
});

// --- Global error handler (must be last) ---
app.use(errorHandler);

// --- Start server ---
const PORT = config.port;
app.listen(PORT, '0.0.0.0', () => {
  const env = config.nodeEnv;
  process.stdout.write(`DMARC Labs API running on port ${PORT} [${env}]\n`);
});

module.exports = app;
