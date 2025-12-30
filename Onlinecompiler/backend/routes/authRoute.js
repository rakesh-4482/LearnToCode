import express from "express";
import {
    register,
    login,
    logout,
    getProfile,
    updateProfile,
    changePassword,
    getUserStats,
    getLeaderboard,
    deleteAccount,
    getAuthStatus,
} from "../controllers/authController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", register); // checked for working perfect
router.post("/login", login); // checked for working perfect
router.get("/status", getAuthStatus); // checked for working perfect
router.get("/leaderboard", getLeaderboard); // checked for working perfect

// Protected routes (require authentication)
router.post("/logout", isAuthenticated, logout); // checked for working perfect
router.get("/profile", isAuthenticated, getProfile); // checked for working perfect
router.put("/profile", isAuthenticated, updateProfile); // checked for working perfect
router.put("/change-password", isAuthenticated, changePassword); // checked for working perfect
router.get("/stats", isAuthenticated, getUserStats); // checked for working perfect
router.delete("/delete-account", isAuthenticated, deleteAccount);

export default router;
