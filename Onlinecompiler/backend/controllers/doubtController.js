import Doubt from "../models/doubtModel.js";
import { User } from "../models/userModel.js";
import mongoose from "mongoose";

// Helper function to clean up old resolved doubts
const cleanupOldResolvedDoubts = async () => {
    try {
        const totalDoubts = await Doubt.countDocuments();
        if (totalDoubts > 1000) { // Increased threshold for forum-style approach
            const doubtsToDelete = totalDoubts - 1000;
            const oldResolvedDoubts = await Doubt.find({ isResolved: true })
                .sort({ lastActivity: 1 })
                .limit(doubtsToDelete)
                .select("_id");

            if (oldResolvedDoubts.length > 0) {
                const idsToDelete = oldResolvedDoubts.map((doubt) => doubt._id);
                await Doubt.deleteMany({ _id: { $in: idsToDelete } });
                console.log(`Deleted ${idsToDelete.length} old resolved doubts`);
            }
        }
    } catch (error) {
        console.error("Error cleaning up old doubts:", error);
    }
};

// Create a new doubt
export const createDoubt = async (req, res) => {
    try {
        const { title, content, tags = [], isAnonymous = false } = req.body;
        const studentId = req.user.id;

        // Validate required fields
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required",
            });
        }

        // Create new doubt with isPublic defaulting to true for forum-style
        const doubt = new Doubt({
            title,
            content,
            student: studentId,
            tags: Array.isArray(tags) ? tags : [tags],
            isAnonymous,
            isPublic: true, // Default to public for forum-style
            lastActivity: new Date()
        });

        await doubt.save();
        await cleanupOldResolvedDoubts();

        // Populate student info for response
        await doubt.populate([
            { path: 'student', select: 'username email isTeacher' },
            { path: 'answers.user', select: 'username email isTeacher' }
        ]);

        res.status(201).json({
            success: true,
            message: "Question posted successfully",
            doubt,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating question",
            error: error.message,
        });
    }
};

// Get all doubts (with filtering, sorting, and pagination)
export const getDoubts = async (req, res) => {
    try {
        const { search, limit = 50, page = 1 } = req.query;
        
        // Build query
        let query = { isPublic: true }; // Only show public doubts by default
        
        // Apply search filter
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Execute query with pagination and sorting
        const doubts = await Doubt.find(query)
            .populate('student', 'username name avatar')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .lean();

        // Return the array of doubts directly to match frontend expectation
        res.status(200).json(doubts);
        
    } catch (error) {
        console.error('Error in getDoubts:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching questions",
            error: error.message,
        });
    }
};

// Get a specific doubt by ID
export const getDoubtById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id; // Make userId optional with ?.
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid question ID"
            });
        }

        const doubt = await Doubt.findById(id)
            .populate('student', 'username email isTeacher')
            .populate('answers.user', 'username email isTeacher');

        if (!doubt) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }

        // For unauthenticated users, only show public doubts
        if (!userId) {
            if (!doubt.isPublic) {
                return res.status(403).json({
                    success: false,
                    message: "Please sign in to view this question"
                });
            }
        } else {
            // For authenticated users, check permissions
            const user = await User.findById(userId);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "User not found"
                });
            }
            
            // Allow access if user is owner, teacher, or doubt is public
            const isOwner = doubt.student?._id?.equals(userId);
            if (!user.isTeacher && !isOwner && !doubt.isPublic) {
                return res.status(403).json({
                    success: false,
                    message: "You don't have permission to view this question"
                });
            }
        }

        // Increment view count if user is authenticated
        if (userId) {
            doubt.views += 1;
            await doubt.save();
        }

        res.status(200).json({
            success: true,
            doubt
        });
    } catch (error) {
        console.error('Error in getDoubtById:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching question",
            error: error.message,
        });
    }
};

// Add an answer to a doubt
export const addAnswer = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, isAnonymous = false } = req.body;
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid question ID"
            });
        }

        // Validate content
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Answer content is required"
            });
        }

        const doubt = await Doubt.findById(id);
        if (!doubt) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }

        // Check if question is closed
        if (doubt.isResolved) {
            return res.status(400).json({
                success: false,
                message: "This question is already marked as resolved"
            });
        }

        // Create new answer
        const newAnswer = {
            user: userId,
            content: content.trim(),
            isAnonymous: !!isAnonymous,
            votes: 0,
            voters: [],
            isSolution: false,
            createdAt: new Date()
        };

        // Add answer to doubt
        doubt.answers.push(newAnswer);
        doubt.lastActivity = new Date();
        
        // Save the updated doubt
        const updatedDoubt = await doubt.save();
        
        // Get the newly added answer with populated user data
        const populatedDoubt = await Doubt.findById(updatedDoubt._id)
            .populate('student', 'username email isTeacher')
            .populate('answers.user', 'username email isTeacher');

        // Find the newly added answer (it will be the last one in the array)
        const addedAnswer = populatedDoubt.answers[populatedDoubt.answers.length - 1];

        res.status(201).json({
            success: true,
            message: "Answer added successfully",
            answer: addedAnswer
        });
    } catch (error) {
        console.error('Error in addAnswer:', error);
        res.status(500).json({
            success: false,
            message: "Error adding answer",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Vote on a doubt or answer
export const vote = async (req, res) => {
    try {
        const { id } = req.params;
        const { voteType, answerId } = req.body;
        const userId = req.user.id;

        if (!['up', 'down'].includes(voteType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid vote type. Must be 'up' or 'down'"
            });
        }

        const update = answerId 
            ? { 
                $inc: { 'answers.$[answer].votes': voteType === 'up' ? 1 : -1 },
                $push: { 'answers.$[answer].voters': { userId, voteType } }
              }
            : { 
                $inc: { votes: voteType === 'up' ? 1 : -1 },
                $push: { voters: { userId, voteType } }
              };

        const options = answerId 
            ? { 
                arrayFilters: [{ 'answer._id': answerId }],
                new: true
              }
            : { new: true };

        const updatedDoubt = await Doubt.findByIdAndUpdate(id, update, options)
            .populate('student', 'username email isTeacher')
            .populate('answers.user', 'username email isTeacher');

        if (!updatedDoubt) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Vote recorded successfully",
            doubt: updatedDoubt
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error recording vote",
            error: error.message,
        });
    }
};

// Mark an answer as solution
export const markAsSolution = async (req, res) => {
    try {
        const { id, answerId } = req.params;
        const userId = req.user.id;

        const doubt = await Doubt.findById(id);
        if (!doubt) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }

        // Check if user is the question author or a teacher
        const user = await User.findById(userId);
        if (!doubt.student.equals(userId) && !user.isTeacher) {
            return res.status(403).json({
                success: false,
                message: "Only the question author or a teacher can mark an answer as solution"
            });
        }

        // Find the answer
        const answer = doubt.answers.id(answerId);
        if (!answer) {
            return res.status(404).json({
                success: false,
                message: "Answer not found"
            });
        }

        // Toggle solution status
        const isSolution = !answer.isSolution;
        
        // Update answer and doubt
        answer.isSolution = isSolution;
        answer.solutionMarkedAt = isSolution ? new Date() : null;
        answer.solutionMarkedBy = isSolution ? userId : null;
        doubt.isResolved = isSolution;
        doubt.lastActivity = new Date();

        // If marking as solution, unmark any other solutions
        if (isSolution) {
            doubt.answers.forEach(a => {
                if (!a._id.equals(answerId) && a.isSolution) {
                    a.isSolution = false;
                    a.solutionMarkedAt = null;
                    a.solutionMarkedBy = null;
                }
            });
        }

        await doubt.save();

        // Populate before sending response
        const populatedDoubt = await Doubt.findById(doubt._id)
            .populate('student', 'username email isTeacher')
            .populate('answers.user', 'username email isTeacher');

        res.status(200).json({
            success: true,
            message: isSolution ? "Answer marked as solution" : "Solution mark removed",
            doubt: populatedDoubt
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating solution status",
            error: error.message,
        });
    }
};

// Get user's own doubts
export const getMyDoubts = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

        const doubts = await Doubt.find({ student: userId })
            .populate('student', 'username email isTeacher')
            .populate('answers.user', 'username email isTeacher')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const count = await Doubt.countDocuments({ student: userId });

        res.status(200).json({
            success: true,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalDoubts: count,
            doubts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching your questions",
            error: error.message,
        });
    }
};

// Get popular tags
export const getPopularTags = async (req, res) => {
    try {
        const tags = await Doubt.aggregate([
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]);

        res.status(200).json({
            success: true,
            tags: tags.map(tag => ({
                name: tag._id,
                count: tag.count
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching popular tags",
            error: error.message,
        });
    }
};
