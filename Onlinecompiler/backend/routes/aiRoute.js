// AI Routes - Handles all AI-powered feature endpoints
import express from 'express';
import rateLimit from 'express-rate-limit';
import {
    generateTestCases,
    explainError,
    getLearningRecommendations,
    generateHint,
    addAITestCasesToQuestion,
    handleAIChat,
    debugGroqAPI
} from '../controllers/aiController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rate limiting configuration for AI endpoints
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { 
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes' 
    }
});

// Apply rate limiting to all AI routes
router.use(aiLimiter);

// Debug endpoint (no auth required for testing)
router.get('/debug', debugGroqAPI);

// Chat endpoint (no auth required for now)
router.post('/chat', handleAIChat);

// Protected routes (require authentication)
router.post('/generate-test-cases', isAuthenticated, generateTestCases);
router.post('/explain-error', isAuthenticated, explainError);
router.get('/recommendations', isAuthenticated, getLearningRecommendations);
router.post('/generate-hint', isAuthenticated, generateHint);
router.post('/add-test-cases', isAuthenticated, addAITestCasesToQuestion);

export default router;
