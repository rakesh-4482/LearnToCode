import { executeCode } from '../services/codeExecutionService.js';
import Problem from '../models/problemModel.js';
import { NotFoundError, BadRequestError } from '../utils/errorHandler.js';
import mongoose from 'mongoose';

/**
 * @desc    Get all problems with pagination and filtering
 * @route   GET /api/problems
 * @access  Public
 */
export const getProblems = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, difficulty, category, search } = req.query;
        
        // Build query
        const query = { isActive: true };
        
        if (difficulty) {
            query.difficulty = difficulty.toLowerCase();
        }
        
        if (category) {
            query.category = { $in: category.split(',').map(cat => cat.trim()) };
        }
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        
        // Execute query with pagination
        const problems = await Problem.find(query)
            .select('-testCases -starterCode -hints -functionSignature -constraints')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        // Get total count for pagination
        const total = await Problem.countDocuments(query);
        
        res.status(200).json({
            success: true,
            count: problems.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: problems
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single problem by ID
 * @route   GET /api/problems/:id
 * @access  Public
 */
export const getProblem = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestError('Invalid problem ID');
        }
        
        const problem = await Problem.findById(id);
        
        if (!problem) {
            throw new NotFoundError('Problem not found');
        }
        
        // Only include public test cases in the response
        const problemObj = problem.toObject();
        if (problemObj.testCases) {
            problemObj.testCases = problemObj.testCases.filter(testCase => testCase.isPublic);
        }
        
        res.status(200).json({
            success: true,
            data: problemObj
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single problem by slug
 * @route   GET /api/problems/slug/:slug
 * @access  Public
 */
export const getProblemBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        
        if (!slug) {
            throw new BadRequestError('Slug parameter is required');
        }

        console.log('Looking up problem with slug:', slug);
        
        const problem = await Problem.findOne({ 
            slug: slug.trim().toLowerCase(),
            isActive: true 
        }).select('-testCases').lean();

        console.log('Found problem:', problem ? problem.title : 'Not found');

        if (!problem) {
            // Try to find any problem with a similar slug for better error messaging
            const similarProblems = await Problem.find({
                slug: { $regex: slug, $options: 'i' },
                isActive: true
            }).select('slug title').limit(3).lean();

            const error = new Error('Problem not found');
            error.statusCode = 404;
            error.similarProblems = similarProblems;
            throw error;
        }

        res.status(200).json({
            success: true,
            data: problem
        });
    } catch (error) {
        console.error('Error in getProblemBySlug:', error);
        next(error);
    }
};

export default {
    getProblems,
    getProblem,
    getProblemBySlug
};