import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errorHandler.js';
import {User} from '../models/userModel.js';

/**
 * Middleware to protect routes that require authentication
 */
export const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            throw new UnauthorizedError('No token provided');
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new UnauthorizedError('No token provided');
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from the token
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            throw new UnauthorizedError('Invalid token');
        }
        if (error.name === 'TokenExpiredError') {
            throw new UnauthorizedError('Token expired');
        }
        throw error;
    }
};

/**
 * Middleware to authorize based on user roles
 * @param {...string} roles - Allowed roles
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new UnauthorizedError('User not authenticated');
        }
        
        if (!roles.includes(req.user.role)) {
            throw new ForbiddenError('Not authorized to access this route');
        }
        
        next();
    };
};
