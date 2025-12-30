/**
 * Custom error class for handling API errors
 */
class ApiError extends Error {
    /**
     * @param {number} statusCode - HTTP status code
     * @param {string} message - Error message
     * @param {Array} errors - Array of error objects
     * @param {string} stack - Error stack trace
     */
    constructor(statusCode, message, errors = [], stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * 400 Bad Request Error
 */
class BadRequestError extends ApiError {
    constructor(message = 'Bad Request', errors = []) {
        super(400, message, errors);
    }
}

/**
 * 401 Unauthorized Error
 */
class UnauthorizedError extends ApiError {
    constructor(message = 'Unauthorized', errors = []) {
        super(401, message, errors);
    }
}

/**
 * 403 Forbidden Error
 */
class ForbiddenError extends ApiError {
    constructor(message = 'Forbidden', errors = []) {
        super(403, message, errors);
    }
}

/**
 * 404 Not Found Error
 */
class NotFoundError extends ApiError {
    constructor(message = 'Not Found', errors = []) {
        super(404, message, errors);
    }
}

/**
 * 500 Internal Server Error
 */
class InternalServerError extends ApiError {
    constructor(message = 'Internal Server Error', errors = []) {
        super(500, message, errors);
    }
}

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log to console for development
    console.error(err.stack);

    // Handle specific error types
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = new NotFoundError(message);
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new BadRequestError('Validation failed', message);
    }

    // Handle duplicate key errors
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `Duplicate field value: ${field}. Please use another value.`;
        error = new BadRequestError(message);
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = new UnauthorizedError(message);
    }

    // Handle JWT expired
    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = new UnauthorizedError(message);
    }

    // Default to 500 Internal Server Error
    if (!(error instanceof ApiError)) {
        error = new InternalServerError(err.message);
    }

    // Send error response
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal Server Error',
        errors: error.errors || [],
        stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack
    });
};

export {
    ApiError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    InternalServerError,
    errorHandler
};
