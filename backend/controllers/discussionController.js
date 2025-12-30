// backend/controllers/discussionController.js
import Discussion from "../models/discussionModel.js";
import { Question } from "../models/questionModel.js";

// Create a new discussion/comment
export const createDiscussion = async (req, res) => {
    try {
        const { questionId, content, parentComment } = req.body;
        const author = req.user.id;

        // Verify question exists
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        // If parentComment is provided, verify it exists
        if (parentComment) {
            const parentExists = await Discussion.findById(parentComment);
            if (!parentExists) {
                return res
                    .status(404)
                    .json({ message: "Parent comment not found" });
            }
        }

        const discussion = new Discussion({
            questionId,
            author,
            content,
            parentComment: parentComment || null,
        });

        await discussion.save();

        // Populate author info before sending response
        await discussion.populate("author", "username email");

        res.status(201).json({
            message: "Discussion created successfully",
            discussion,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all discussions for a question
export const getDiscussionsByQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get only top-level comments (no parentComment)
        const discussions = await Discussion.find({
            questionId,
            parentComment: null,
        })
            .populate("author", "username email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get replies for each discussion
        const discussionsWithReplies = await Promise.all(
            discussions.map(async (discussion) => {
                const replies = await Discussion.find({
                    parentComment: discussion._id,
                })
                    .populate("author", "username email")
                    .sort({ createdAt: 1 });

                return {
                    ...discussion.toObject(),
                    replies,
                };
            })
        );

        const totalDiscussions = await Discussion.countDocuments({
            questionId,
            parentComment: null,
        });

        res.json({
            discussions: discussionsWithReplies,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalDiscussions / limit),
                totalDiscussions,
                hasMore: page < Math.ceil(totalDiscussions / limit),
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Like a discussion
export const likeDiscussion = async (req, res) => {
    try {
        const { discussionId } = req.params;
        const userId = req.user.id;

        const discussion = await Discussion.findById(discussionId);
        if (!discussion) {
            return res.status(404).json({ message: "Discussion not found" });
        }

        // Remove from dislikes if present
        discussion.dislikes = discussion.dislikes.filter(
            (id) => id.toString() !== userId
        );

        // Toggle like
        const likeIndex = discussion.likes.findIndex(
            (id) => id.toString() === userId
        );

        if (likeIndex > -1) {
            discussion.likes.splice(likeIndex, 1);
        } else {
            discussion.likes.push(userId);
        }

        await discussion.save();

        res.json({
            message: "Discussion like updated",
            likes: discussion.likes.length,
            dislikes: discussion.dislikes.length,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Dislike a discussion
export const dislikeDiscussion = async (req, res) => {
    try {
        const { discussionId } = req.params;
        const userId = req.user.id;

        const discussion = await Discussion.findById(discussionId);
        if (!discussion) {
            return res.status(404).json({ message: "Discussion not found" });
        }

        // Remove from likes if present
        discussion.likes = discussion.likes.filter(
            (id) => id.toString() !== userId
        );

        // Toggle dislike
        const dislikeIndex = discussion.dislikes.findIndex(
            (id) => id.toString() === userId
        );

        if (dislikeIndex > -1) {
            discussion.dislikes.splice(dislikeIndex, 1);
        } else {
            discussion.dislikes.push(userId);
        }

        await discussion.save();

        res.json({
            message: "Discussion dislike updated",
            likes: discussion.likes.length,
            dislikes: discussion.dislikes.length,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Edit a discussion
export const editDiscussion = async (req, res) => {
    try {
        const { discussionId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        const discussion = await Discussion.findById(discussionId);
        if (!discussion) {
            return res.status(404).json({ message: "Discussion not found" });
        }

        // Check if user is the author
        if (discussion.author.toString() !== userId) {
            return res
                .status(403)
                .json({ message: "You can only edit your own discussions" });
        }

        discussion.content = content;
        discussion.isEdited = true;
        discussion.editedAt = new Date();

        await discussion.save();
        await discussion.populate("author", "username email");

        res.json({
            message: "Discussion updated successfully",
            discussion,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a discussion
export const deleteDiscussion = async (req, res) => {
    try {
        const { discussionId } = req.params;
        const userId = req.user.id;

        const discussion = await Discussion.findById(discussionId);
        if (!discussion) {
            return res.status(404).json({ message: "Discussion not found" });
        }

        // Check if user is the author
        if (discussion.author.toString() !== userId) {
            return res
                .status(403)
                .json({ message: "You can only delete your own discussions" });
        }

        // Delete all replies to this discussion
        await Discussion.deleteMany({ parentComment: discussionId });

        // Delete the discussion itself
        await Discussion.findByIdAndDelete(discussionId);

        res.json({ message: "Discussion deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
