// Centralised error handler. Distinguishes operational (status set) errors from unexpected.
function errorHandler(err, req, res, _next) {
  // eslint-disable-next-line no-console
  console.error('[error]', err.message);
  // Multer file-size etc. → friendlier 400 messages
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Maximum size is 1MB.' });
  }
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    details: err.details || undefined,
  });
}

module.exports = errorHandler;
