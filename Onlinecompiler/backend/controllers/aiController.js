// AI Controller - Handles AI-powered features for ByteSmith
import aiService from '../services/aiService.js';
import { Question } from '../models/questionModel.js';
import { User } from '../models/userModel.js';
import { validationResult } from 'express-validator';

// Validation middleware for AI endpoints
export const validateAIRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// Rate limiting error handler
export const handleRateLimit = (req, res) => {
    res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later.'
    });
};

/**
 * Generate test cases for a question using AI
 */
export const generateTestCases = async (req, res) => {
    try {
        const { questionId, numTestCases = 5 } = req.body;
        const userId = req.user.id;

        // Input validation
        if (!questionId) {
            return res.status(400).json({
                success: false,
                message: 'Question ID is required'
            });
        }

        // Get question data
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // Generate test cases using AI service
        const testCases = await aiService.generateTestCases(question, numTestCases);

        res.json({
            success: true,
            data: {
                questionId: question._id,
                testCases,
                generatedAt: new Date()
            }
        });
    } catch (error) {
        console.error('Error generating test cases:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate test cases',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

/**
 * Explain coding errors using AI
 */
export const explainError = async (req, res) => {
    try {
        const { errorMessage, code, language } = req.body;
        const userId = req.user.id;

        // Input validation
        if (!errorMessage || !code || !language) {
            return res.status(400).json({
                success: false,
                message: 'Error message, code, and language are required'
            });
        }

        // Explain error using AI service
        const explanation = await aiService.explainError(errorMessage, code, language);

        res.json({
            success: true,
            data: {
                explanation,
                language,
                explainedAt: new Date()
            }
        });
    } catch (error) {
        console.error('Error explaining error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to explain error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Generate personalized learning recommendations
 */
export const getLearningRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get user data
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Build user profile with basic info (no submission history)
        const userProfile = {
            userId: user._id,
            username: user.username,
            email: user.email,
            solvedProblems: user.solvedProblems || [],
            preferredLanguages: user.preferredLanguages || [],
            difficultyLevel: user.difficultyLevel || 'beginner',
            learningGoals: user.learningGoals || []
        };

        // Get recommendations from AI service
        const recommendations = await aiService.generateLearningRecommendations(userProfile);

        res.json({
            success: true,
            data: recommendations
        });
    } catch (error) {
        console.error('Error getting learning recommendations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get learning recommendations',
            error: error.message
        });
    }
};

/**
 * Generate hints for a specific problem
 */
export const generateHint = async (req, res) => {
    try {
        const { questionId, userCode = '', hintLevel = 1 } = req.body;
        const userId = req.user.id;

        // Input validation
        if (!questionId) {
            return res.status(400).json({
                success: false,
                message: 'Question ID is required'
            });
        }

        // Get question data
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // Generate hint using AI service
        const hint = await aiService.generateHint(question, userCode, hintLevel);

        res.json({
            success: true,
            data: {
                questionId: question._id,
                hintLevel,
                hint,
                generatedAt: new Date()
            }
        });
    } catch (error) {
        console.error('Error generating hint:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate hint',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Add AI-generated test cases to a question
 */
export const addAITestCasesToQuestion = async (req, res) => {
    try {
        const { questionId, numTestCases = 5 } = req.body;
        const userId = req.user.id;

        // Check if user has permission to modify the question
        // (Add your permission logic here)

        // Get question data
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // Generate test cases using AI
        const testCases = await aiService.generateTestCases(question, numTestCases);

        // Add test cases to question
        question.testCases = question.testCases || [];
        question.testCases.push(...testCases.map(tc => ({
            input: tc.input,
            expectedOutput: tc.output,
            isHidden: false,
            isSample: true,
            explanation: tc.explanation || 'AI-generated test case'
        })));

        await question.save();

        res.json({
            success: true,
            message: `Added ${testCases.length} AI-generated test cases to question`,
            data: {
                questionId: question._id,
                addedCount: testCases.length,
                totalTestCases: question.testCases.length
            }
        });
    } catch (error) {
        console.error('Error adding AI test cases:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add AI test cases',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Handle general AI chat messages
 */
export const handleAIChat = async (req, res) => {
  console.log('🔵 Received AI chat request:', {
    service: req.body.service,
    messageLength: req.body.message?.length,
    userId: req.user?.id
  });

  try {
    const { message, service = 'general' } = req.body;
    
    if (!message) {
      console.warn('❌ Missing message in request');
      return res.status(400).json({ 
        success: false, 
        message: 'Message is required' 
      });
    }

    console.log(`🔄 Processing ${service} request...`);
    
    let response;
    try {
      switch (service) {
        case 'general':
          response = await aiService.chat(message);
          break;
        case 'code_explanation':
          response = await aiService.explainCode(message);
          break;
        case 'test_cases':
          response = await aiService.generateTestCases({ title: 'Code Test Case Generation', description: message });
          break;
        case 'error_explanation':
          response = await aiService.explainError(
            message.code || '', 
            message.error || 'Unknown error', 
            message.language || ''
          );
          break;
        default:
          console.warn(`❌ Invalid service type: ${service}`);
          return res.status(400).json({ 
            success: false, 
            message: `Invalid service type: ${service}. Valid types are: general, code_explanation, test_cases, error_explanation`
          });
      }

      console.log('✅ AI request completed successfully');
      
      // Return the response in the format the frontend expects
      res.json({ 
        success: true, 
        response: response.response || response, // Handle both formats
        model: response.model,
        timestamp: response.timestamp
      });
      
    } catch (serviceError) {
      console.error('❌ Service error in handleAIChat:', {
        message: serviceError.message,
        stack: serviceError.stack,
        name: serviceError.name,
        service,
        messagePreview: String(message).substring(0, 100)
      });
      
      // More specific error messages based on error type
      let errorMessage = 'An error occurred while processing your request';
      let statusCode = 500;
      
      if (serviceError.message.includes('API key') || serviceError.message.includes('authentication')) {
        errorMessage = 'Authentication error with AI service';
        statusCode = 503; // Service Unavailable
      } else if (serviceError.message.includes('timeout') || serviceError.message.includes('timed out')) {
        errorMessage = 'Request to AI service timed out. Please try again.';
        statusCode = 504; // Gateway Timeout
      }
      
      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && {
          error: serviceError.message,
          stack: serviceError.stack
        })
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error in handleAIChat:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      request: {
        service: req.body.service,
        messageLength: req.body.message?.length,
        userId: req.user?.id
      }
    });
    
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred',
      ...(process.env.NODE_ENV === 'development' && {
        error: error.message,
        stack: error.stack
      })
    });
  }
};

/**
 * Debug endpoint to test Groq API directly
 */
export const debugGroqAPI = async (req, res) => {
  try {
    console.log('🔧 Debug: Testing Groq API directly...');
    
    // Test the API key and service
    const response = await aiService.chat('Hello, this is a test message.');
    
    console.log('✅ Debug: Groq API test successful');
    res.json({
      success: true,
      message: 'Groq API test successful',
      response: response
    });
    
  } catch (error) {
    console.error('❌ Debug: Groq API test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Groq API test failed',
      error: error.message,
      details: {
        name: error.name,
        stack: error.stack
      }
    });
  }
};

/**
 * Health check endpoint for the AI service
 */
export const checkAIHealth = async (req, res) => {
  try {
    // Just check if we can get the API key as a basic health check
    await aiService.getApiKey();
    res.json({ 
      status: 'ok',
      service: 'ai',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ AI health check failed:', error);
    res.status(503).json({
      status: 'error',
      service: 'ai',
      error: 'AI service is not available',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Helper function to build user profile for AI analysis
 */
const buildUserProfile = (user) => {
    // Simplified version without submission history
    return {
        userId: user._id,
        username: user.username,
        email: user.email,
        solvedProblems: user.solvedProblems || [],
        preferredLanguages: user.preferredLanguages || [],
        difficultyLevel: user.difficultyLevel || 'beginner',
        learningGoals: user.learningGoals || []
    };
};

export default {
    generateTestCases,
    explainError,
    getLearningRecommendations,
    generateHint,
    addAITestCasesToQuestion,
    handleAIChat,
    checkAIHealth,
    debugGroqAPI,
    validateAIRequest,
    handleRateLimit
};
