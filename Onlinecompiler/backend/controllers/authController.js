import { User } from "../models/userModel.js";
import passport from "passport";

// Register user
export const register = async (req, res) => {
    try {
        const { username, email, password, name, isTeacher, bio } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }],
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User with this email or username already exists",
            });
        }

        // Create user
        const user = await User.create({
            username,
            email,
            password,
            name,
            isTeacher: isTeacher || false,
            bio,
        });

        // Auto login after registration
        req.login(user, (err) => {
            if (err) {
                return res.status(500).json({
                    message: "Registration successful but auto-login failed",
                });
            }

            res.status(201).json({
                success: true,
                message: "User registered successfully",
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    name: user.name,
                    isTeacher: user.isTeacher,
                    bio: user.bio,
                    avatar: user.avatar,
                },
            });
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

// Login user
export const login = (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Server error",
                error: err.message,
            });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: info.message || "Invalid credentials",
            });
        }

        req.login(user, (err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Login failed",
                    error: err.message,
                });
            }

            res.status(200).json({
                success: true,
                message: "Login successful",
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    name: user.name,
                    isTeacher: user.isTeacher,
                    bio: user.bio,
                    avatar: user.avatar,
                },
            });
        });
    })(req, res, next);
};

// Logout user
export const logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Logout failed",
            });
        }

        res.status(200).json({
            success: true,
            message: "Logout successful",
        });
    });
};

// Get current user profile
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate("solvedProblems", "title difficulty")
            .select("-password");

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const { name, bio, avatar } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, bio, avatar },
            { new: true, runValidators: true }
        ).select("-password");

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

// Change password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Please provide current and new password",
            });
        }

        const user = await User.findById(req.user.id).select("+password");

        // Check current password
        const isPasswordMatched = await user.comparePassword(currentPassword);

        if (!isPasswordMatched) {
            return res.status(401).json({
                message: "Current password is incorrect",
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

// Get user statistics
export const getUserStats = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate("solvedProblems", "difficulty")
            .select("-password");

        // Calculate difficulty-wise solved problems
        const solvedByDifficulty = user.solvedProblems.reduce(
            (acc, problem) => {
                acc[problem.difficulty] = (acc[problem.difficulty] || 0) + 1;
                return acc;
            },
            {}
        );

        const stats = {
            totalSolved: user.solvedProblems.length,
            totalSubmissions: user.submissionsCount,
            rating: user.rating,
            solvedByDifficulty,
            recentlySolved: user.solvedProblems.slice(-5), // Last 5 solved problems
        };

        res.status(200).json({
            success: true,
            stats,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

// Get leaderboard
export const getLeaderboard = async (req, res) => {
    try {
        const { limit = 10, page = 1 } = req.query;

        const users = await User.find({ isTeacher: { $ne: true } })
            .sort({ rating: -1, solvedProblems: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select(
                "username name rating solvedProblems submissionsCount avatar"
            )
            .populate("solvedProblems", "difficulty");

        const leaderboard = users.map((user, index) => ({
            rank: (page - 1) * limit + index + 1,
            username: user.username,
            avatar: user.avatar,
            name: user.name,
            rating: user.rating,
            totalSolved: user.solvedProblems.length,
            totalSubmissions: user.submissionsCount,
        }));

        res.status(200).json({
            success: true,
            leaderboard,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

// Delete account
export const deleteAccount = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);

        // Logout after deleting account
        req.logout((err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Account deleted but logout failed",
                });
            }

            res.status(200).json({
                success: true,
                message: "Account deleted successfully",
            });
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

// Check authentication status
export const getAuthStatus = (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json({
            success: true,
            authenticated: true,
            user: {
                id: req.user._id,
                username: req.user.username,
                email: req.user.email,
                name: req.user.name,
                isTeacher: req.user.isTeacher,
                bio: req.user.bio,
                avatar: req.user.avatar,
            },
        });
    } else {
        res.status(200).json({
            success: true,
            authenticated: false,
            user: null,
        });
    }
};
