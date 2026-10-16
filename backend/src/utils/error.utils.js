/**
 * Centralized error classes and PostgreSQL error mapping
 */

class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   * @param {any} [details=null]
   */
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Maps PostgreSQL specific errors to user-friendly HTTP exceptions
 * @param {Error} err
 * @param {object} [customConstraintMessages={}]
 * @returns {AppError}
 */
function mapDatabaseError(err, customConstraintMessages = {}) {
  // If already an AppError, return directly
  if (err instanceof AppError) {
    return err;
  }

  // 23505: Unique violation
  if (err.code === '23505') {
    const constraint = err.constraint;
    if (constraint && customConstraintMessages[constraint]) {
      return new AppError(customConstraintMessages[constraint], 409);
    }
    return new AppError('A record with the specified unique values already exists.', 409);
  }

  // 23503: Foreign key violation
  if (err.code === '23503') {
    return new AppError('Referenced resource was not found.', 400);
  }

  // 23514: Check constraint violation
  if (err.code === '23514') {
    const constraint = err.constraint;
    if (constraint && customConstraintMessages[constraint]) {
      return new AppError(customConstraintMessages[constraint], 400);
    }
    return new AppError('The submitted data violates database validation constraints.', 400);
  }

  // 22P02: Invalid text representation (e.g., malformed uuid or int)
  if (err.code === '22P02') {
    return new AppError('Invalid input syntax for parameter or field.', 400);
  }

  // Default internal server error (never leak raw error messages with sensitive DB info)
  return new AppError('An unexpected server error occurred.', 500);
}

module.exports = {
  AppError,
  mapDatabaseError,
};
