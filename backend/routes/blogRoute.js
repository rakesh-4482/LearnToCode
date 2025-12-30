import express from "express";
import {
    getAllBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    toggleLike,
    addComment,
    deleteComment,
} from "../controllers/blogController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllBlogs);
router.get("/:id", getBlogById);

// Protected routes (require authentication)
router.post("/", isAuthenticated, createBlog);
router.put("/:id", isAuthenticated, updateBlog);
router.delete("/:id", isAuthenticated, deleteBlog);
router.post("/:id/like", isAuthenticated, toggleLike);
router.post("/:id/comment", isAuthenticated, addComment);
router.delete("/:blogId/comment/:commentId", isAuthenticated, deleteComment);

export default router;
