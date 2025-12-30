import express from "express";
import { 
    createDoubt, 
    getDoubts, 
    getDoubtById, 
    addAnswer, 
    vote, 
    markAsSolution, 
    getMyDoubts,
    getPopularTags
} from "../controllers/doubtController.js";
import { isAuthenticated, optionalAuth } from "../middleware/authMiddleware.js";
import Doubt from "../models/doubtModel.js";

const router = express.Router();

// Get popular tags (public endpoint)
router.get("/tags/popular", getPopularTags);

// Get all doubts with filtering and pagination (public)
router.get("/", getDoubts);

// Get a specific doubt by ID (public, but checks auth inside)
router.get("/:id", optionalAuth, getDoubtById);

// Protected routes (require authentication)
router.use(isAuthenticated);

// Get authenticated user's doubts
router.get("/my-doubts", getMyDoubts);

// Create a new doubt
router.post("/", createDoubt);

// Add an answer to a doubt
router.post("/:id/answers", addAnswer);

// Vote on a doubt or answer
router.post("/:id/vote", vote);

// Mark an answer as solution
router.patch("/:doubtId/solution/:answerId", markAsSolution);

// Delete all doubts (Admin only)
router.delete('/admin/cleanup', async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: Admin access required'
            });
        }
        
        const result = await Doubt.deleteMany({});
        
        res.status(200).json({
            success: true,
            message: `Successfully deleted ${result.deletedCount} doubts`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting doubts',
            error: error.message
        });
    }
});

export default router;
