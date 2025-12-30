import express from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest.js';
import { 
    getProblem, 
    getProblemBySlug, 
    getProblems 
} from '../controllers/problemController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty level'),
    query('category').optional().isString().trim().notEmpty().withMessage('Category cannot be empty'),
    query('search').optional().isString().trim().withMessage('Search query must be a string'),
    validateRequest
  ],
  getProblems
);

// Get problem by ID
router.get(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid problem ID'),
    validateRequest
  ],
  getProblem
);

// Get problem by slug
router.get(
  '/slug/:slug',
  [
    param('slug').isString().notEmpty().withMessage('Slug is required'),
    validateRequest
  ],
  getProblemBySlug
);

export default router;
