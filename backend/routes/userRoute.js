import express from 'express';
import { 
    getUserProfile,
    updateUserProfile,
    registerUser, 
    loginUser, 
    getMe,
    updateUser,
    deleteUser,
    getAllUsers
} from '../controllers/userController.js';
import { getUserPerformance } from '../controllers/performanceController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/', registerUser);
router.post('/login', loginUser);

// Protected routes (require authentication)
router.use(isAuthenticated);

// Get user profile
router.get('/profile', getUserProfile);

// Update user profile
router.put('/profile', updateUserProfile);

// Get me
router.get('/me', getMe);

// Update user
router.put('/:id', updateUser);

// Delete user
router.delete('/:id', deleteUser);

// Get all users
router.get('/all', getAllUsers);

// Performance route
router.get('/performance', getUserPerformance);

export default router;
