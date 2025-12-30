// backend/routes/discussionRoute.js
import express from "express";
import {
    createDiscussion,
    getDiscussionsByQuestion,
    likeDiscussion,
    dislikeDiscussion,
    editDiscussion,
    deleteDiscussion,
} from "../controllers/discussionController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a new discussion/comment
router.post("/", isAuthenticated, createDiscussion);

// Get all discussions for a question
router.get("/question/:questionId", getDiscussionsByQuestion);

// Like a discussion
router.put("/:discussionId/like", isAuthenticated, likeDiscussion);

// Dislike a discussion
router.put("/:discussionId/dislike", isAuthenticated, dislikeDiscussion);

// Edit a discussion
router.put("/:discussionId", isAuthenticated, editDiscussion);

// Delete a discussion
router.delete("/:discussionId", isAuthenticated, deleteDiscussion);

export default router;
