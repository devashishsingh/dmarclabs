/**
 * Centralized error handler — converts thrown errors into consistent JSON responses.
 * Mount as the LAST middleware in the Express chain.
 */
function errorHandler(err, req, res, next) {
  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'FILE_TOO_LARGE',
      message: 'File exceeds 100MB free tier limit',
      actionUrl: '/request-access',
    });
  }

  // CORS rejection
  if (err.message && err.message.startsWith('CORS blocked')) {
    return res.status(403).json({
      error: 'CORS_BLOCKED',
      message: err.message,
    });
  }

  // Validation errors (thrown explicitly with status)
  if (err.status) {
    return res.status(err.status).json({
      error: err.code || 'REQUEST_ERROR',
      message: err.message,
    });
  }

  // Generic server error — never expose stack in production
  const isProduction = process.env.NODE_ENV === 'production';
  return res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: isProduction ? 'An unexpected error occurred' : err.message,
  });
}

module.exports = errorHandler;
