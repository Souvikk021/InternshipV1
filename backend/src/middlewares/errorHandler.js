const { sendError } = require('../utils/response');

/**
 * Global error handler middleware
 * Must be registered LAST in Express middleware chain
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Prisma-specific errors
  if (err.code === 'P2002') {
    return sendError(res, 'A record with this value already exists', 409);
  }
  if (err.code === 'P2025') {
    return sendError(res, 'Record not found', 404);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token has expired', 401);
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  return sendError(res, message, statusCode);
};

module.exports = { errorHandler };
