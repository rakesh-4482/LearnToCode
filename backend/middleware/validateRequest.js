import { validationResult } from 'express-validator';
import { BadRequestError } from '../utils/errorHandler.js';

/**
 * Middleware to validate request using express-validator
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.param,
            message: error.msg,
            value: error.value
        }));
        
        throw new BadRequestError('Validation failed', errorMessages);
    }
    next();
};

/**
 * Middleware to validate MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};
