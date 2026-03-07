const notFound = (req, res, _next) => {
  res.status(404).json({
    message: `Route not found: ${req.originalUrl}`
  });
};

const errorHandler = (err, _req, res, _next) => {
  const isCorsError = typeof err?.message === 'string' && err.message.startsWith('CORS blocked');
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : isCorsError ? 403 : 500;

  res.status(statusCode).json({
    message: err.message || 'Internal server error'
  });
};

module.exports = { notFound, errorHandler };
