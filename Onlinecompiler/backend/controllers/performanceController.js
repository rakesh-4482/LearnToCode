import User from '../models/userModel.js';
import Problem from '../models/problem.js';
import UserQuestion from '../models/userQuestionModel.js';

// Debug function with timestamp
const debugLog = (...args) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] PerformanceController:`, ...args);
};

// @desc    Get user performance metrics
// @route   GET /api/users/performance
// @access  Private
export const getUserPerformance = async (req, res) => {
    try {
        const userId = req.user._id;
        const { timeRange = 'all' } = req.query;
        
        console.log('Fetching performance data for user:', userId, 'Time range:', timeRange);
        
        // Calculate date range based on timeRange
        let startDate = new Date(0); // Beginning of time
        if (timeRange === 'week') {
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
        } else if (timeRange === 'month') {
            startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 1);
        }

        // Get user's solved problems
        const userQuestions = await UserQuestion.find({
            user: userId,
            lastAttempted: { $gte: startDate },
            status: 'solved'
        }).populate('problem');

        // Calculate metrics
        const totalSolved = userQuestions.length;
        const problemsByDifficulty = userQuestions.reduce((acc, uq) => {
            const difficulty = uq.problem?.difficulty?.toLowerCase() || 'unknown';
            acc[difficulty] = (acc[difficulty] || 0) + 1;
            return acc;
        }, {});

        // Get recent activity
        const recentActivity = userQuestions
            .sort((a, b) => b.lastAttempted - a.lastAttempted)
            .slice(0, 5)
            .map(uq => ({
                problemTitle: uq.problem?.title || 'Unknown Problem',
                language: uq.language || 'unknown',
                status: 'solved',
                runtime: uq.runtime || 0,
                timestamp: uq.lastAttempted
            }));

        // Calculate success rate (mock value for now)
        const successRate = userQuestions.length > 0 ? 
            Math.min(100, Math.floor((userQuestions.filter(q => q.status === 'solved').length / userQuestions.length) * 100)) : 0;

        // Calculate average runtime (mock value for now)
        const avgRuntime = userQuestions.length > 0 ?
            Math.round(userQuestions.reduce((sum, q) => sum + (q.runtime || 0), 0) / userQuestions.length) : 0;

        // Prepare response data
        const responseData = {
            totalSolved,
            successRate,
            avgRuntime,
            totalSubmissions: userQuestions.length, // Same as totalSolved for now
            submissionTrend: [], // Empty for now
            languageDistribution: [], // Empty for now
            difficultyDistribution: Object.entries(problemsByDifficulty).map(([difficulty, count]) => ({
                name: difficulty,
                value: count
            })),
            difficultyStats: {
                easy: {
                    solved: problemsByDifficulty.easy || 0,
                    total: 0, // You'll need to fetch total problems by difficulty
                    percentage: 0 // Calculate if needed
                },
                medium: {
                    solved: problemsByDifficulty.medium || 0,
                    total: 0, // You'll need to fetch total problems by difficulty
                    percentage: 0 // Calculate if needed
                },
                hard: {
                    solved: problemsByDifficulty.hard || 0,
                    total: 0, // You'll need to fetch total problems by difficulty
                    percentage: 0 // Calculate if needed
                }
            },
            recentActivity,
            timeRange
        };

        res.status(200).json({
            success: true,
            data: responseData
        });

    } catch (error) {
        console.error('Error in getUserPerformance:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching performance data',
            error: error.message
        });
    }
};

export default {
    getUserPerformance
};
