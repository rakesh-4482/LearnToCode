import { User } from '../models/userModel.js';
import Problem from '../models/problemModel.js';
import { BadRequestError, NotFoundError } from '../utils/errorHandler.js';

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password -refreshToken -__v')
            .lean();
            
        if (!user) {
            throw new NotFoundError('User not found');
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res, next) => {
    try {
        const { name, avatar } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, avatar },
            { new: true, runValidators: true }
        ).select('-password -refreshToken -__v');

        if (!user) {
            throw new NotFoundError('User not found');
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getUserProfile,
    updateUserProfile
};
