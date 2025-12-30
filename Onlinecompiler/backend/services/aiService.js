import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

class AIService {
  constructor() {
    this.baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
    this.timeout = 30000; // 30 seconds
    this.model = 'llama3-8b-8192'; // Free Groq model
    this.initialized = false;
    this.initialize();
  }

  async initialize() {
    try {
      console.log('Initializing AI service with Groq API...');
      const apiKey = await this.getApiKey();
      if (apiKey) {
        this.initialized = true;
        console.log('✅ Groq AI service initialized successfully');
      }
    } catch (error) {
      console.error('❌ Failed to initialize AI service:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      // Don't throw error in development - just log it
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ AI service will continue without initialization in development mode');
        return;
      }
      throw new Error('AI service initialization failed: ' + error.message);
    }
  }

  async getApiKey() {
    try {
      console.log('🔑 Attempting to get API key...');
      console.log('🔍 Environment check:', {
        NODE_ENV: process.env.NODE_ENV,
        hasGroqKey: !!process.env.GROQ_API_KEY,
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
        groqKeyLength: process.env.GROQ_API_KEY?.length || 0,
        geminiKeyLength: process.env.GEMINI_API_KEY?.length || 0
      });
      
      // In development, try environment variable first
      if (process.env.NODE_ENV === 'development' && process.env.GROQ_API_KEY) {
        console.log('✅ Using GROQ_API_KEY from environment');
        return process.env.GROQ_API_KEY;
      }
      
      // Fallback to Gemini key if Groq not available
      if (process.env.NODE_ENV === 'development' && process.env.GEMINI_API_KEY) {
        console.log('✅ Using GEMINI_API_KEY from environment (fallback)');
        return process.env.GEMINI_API_KEY;
      }
      
      throw new Error('No API key found in environment variables');
      
    } catch (error) {
      console.error('❌ Error getting API key:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw new Error('Failed to retrieve API key: ' + error.message);
    }
  }

  async makeGroqRequest(messages) {
    try {
      const apiKey = await this.getApiKey();
      
      console.log('📤 Making Groq API request:', {
        url: this.baseUrl,
        model: this.model,
        messagesCount: messages.length,
        hasApiKey: !!apiKey,
        apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'none'
      });
      
      const requestBody = {
        model: this.model,
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      };
      
      console.log('📋 Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        timeout: this.timeout,
      });

      console.log('📥 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Groq API error response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText
        });
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Groq API response received:', {
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length || 0,
        usage: data.usage
      });
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from Groq API');
      }

      return {
        success: true,
        response: data.choices[0].message.content,
        model: this.model,
        usage: data.usage,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Groq API request failed:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw error;
    }
  }

  async generateTestCases(questionData, numTestCases = 5) {
    try {
      const prompt = `
You are an expert coding problem setter. Generate ${numTestCases} diverse test cases for the following coding problem.

Problem Title: ${questionData.title}
Problem Statement: ${questionData.problemStatement}
Constraints: ${questionData.constraints || 'No specific constraints mentioned'}
Difficulty: ${questionData.difficulty}
Topics: ${questionData.topics?.join(', ') || 'General'}

Requirements:
1. Generate exactly ${numTestCases} test cases
2. Include edge cases (empty input, maximum constraints, minimum values)
3. Include normal cases with varying complexity
4. Ensure inputs follow the problem constraints
5. Provide correct expected outputs
6. Format as JSON array with "input" and "output" fields

Example format:
[
  {"input": "5\\n1 2 3 4 5", "output": "15"},
  {"input": "3\\n10 20 30", "output": "60"}
]

Generate the test cases now:`;

      const response = await this.makeGroqRequest([{
        role: 'user',
        content: prompt
      }]);
      try {
        const testCases = JSON.parse(response.response);
        return testCases.map(tc => ({
          input: tc.input.replace(/\\n/g, '\n'),
          output: tc.output
        }));
      } catch (e) {
        console.error('Failed to parse AI response:', response.response);
        throw new Error('Failed to generate test cases. Please try again.');
      }
    } catch (error) {
      console.error('Error generating test cases:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw new Error('Failed to generate test cases: ' + error.message);
    }
  }

  async explainError(code, error, language) {
    try {
      const prompt = `
You are a friendly coding tutor helping a beginner understand their coding error.

Programming Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

Error Message:
${error}

Please provide a beginner-friendly explanation in the following JSON format:
{
  "errorType": "Brief category of error (e.g., Syntax Error, Runtime Error, Logic Error)",
  "explanation": "Simple explanation of what went wrong in easy-to-understand language",
  "cause": "What specifically caused this error",
  "solution": "Step-by-step solution to fix the error",
  "tips": "Additional tips to avoid similar errors in the future",
  "correctedCode": "The corrected version of the code (if applicable)"
}

Make sure your explanation is:
- Simple and beginner-friendly
- Encouraging and supportive
- Specific to the actual error
- Includes practical examples where helpful`;

      const response = await this.makeGroqRequest([{
        role: 'user',
        content: prompt
      }]);
      try {
        return JSON.parse(response.response);
      } catch (e) {
        console.error('Failed to parse AI response:', response.response);
        throw new Error('Failed to explain error. Please try again.');
      }
    } catch (error) {
      console.error('Error explaining error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw new Error('Failed to explain error: ' + error.message);
    }
  }

  async generateLearningRecommendations(userProfile) {
    try {
      const prompt = `
You are an AI learning advisor for a coding education platform. Analyze the user's profile and provide personalized recommendations.

User Profile:
- Username: ${userProfile.username}
- Problems Solved: ${userProfile.problemsSolved || 0}
- Difficulty Levels Attempted: ${userProfile.difficultiesAttempted?.join(', ') || 'None'}
- Topics Practiced: ${userProfile.topicsPracticed?.join(', ') || 'None'}
- Average Success Rate: ${userProfile.successRate || 0}%
- Weak Areas: ${userProfile.weakAreas?.join(', ') || 'Unknown'}
- Strong Areas: ${userProfile.strongAreas?.join(', ') || 'Unknown'}
- Recent Activity: ${userProfile.recentActivity || 'No recent activity'}

Provide recommendations in the following JSON format:
{
  "nextTopics": ["Array of 3-5 topics the user should focus on next"],
  "difficultyRecommendation": "Recommended difficulty level to attempt next",
  "specificProblems": ["Array of 3-5 specific problem types to practice"],
  "learningPath": "A brief learning path description (2-3 sentences)",
  "motivationalMessage": "An encouraging message personalized for the user",
  "studyTips": ["Array of 3-4 practical study tips based on their performance"],
  "timeEstimate": "Estimated time to improve in weak areas"
}

Make recommendations that are:
- Personalized to their current skill level
- Progressive and achievable
- Encouraging and motivating
- Specific and actionable`;

      const response = await this.makeGroqRequest([{
        role: 'user',
        content: prompt
      }]);
      try {
        return JSON.parse(response.response);
      } catch (e) {
        console.error('Failed to parse AI response:', response.response);
        throw new Error('Failed to generate recommendations. Please try again.');
      }
    } catch (error) {
      console.error('Error generating recommendations:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw new Error('Failed to generate recommendations: ' + error.message);
    }
  }

  async generateHint(questionData, userCode = '', hintLevel = 1) {
    try {
      const hintLevels = {
        1: "subtle guidance without giving away the solution",
        2: "more specific direction about the approach",
        3: "detailed guidance with algorithm hints"
      };

      const prompt = `
You are a coding tutor providing hints for a programming problem.

Problem: ${questionData.title}
Problem Statement: ${questionData.problemStatement}
Difficulty: ${questionData.difficulty}
${userCode ? `User's Current Code:\n\`\`\`\n${userCode}\n\`\`\`` : ''}

Provide a hint with ${hintLevels[hintLevel]}. The hint should:
- Be encouraging and supportive
- Guide the user toward the solution without giving it away completely
- Be appropriate for the difficulty level
- Help the user think about the problem differently if they're stuck

Return just the hint text (no JSON formatting needed).`;

      const response = await this.makeGroqRequest([{
        role: 'user',
        content: prompt
      }]);
      return response.response;
    } catch (error) {
      console.error('Error generating hint:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw new Error('Failed to generate hint: ' + error.message);
    }
  }

  async chat(message, userContext = {}) {
    try {
      console.log('🤖 Processing chat request:', { message: message.substring(0, 100) + '...' });
      
      // Check if AI is initialized
      if (!this.initialized) {
        console.log('⚠️ Groq AI not initialized, attempting to initialize...');
        await this.initialize();
        
        if (!this.initialized) {
          throw new Error('Groq AI is not available');
        }
      }
      
      const messages = [{
        role: 'user',
        content: message
      }];
      
      if (userContext.userProfile) {
        messages.unshift({
          role: 'system',
          content: `User Context: ${JSON.stringify(userContext.userProfile)}`
        });
      }
      
      const response = await this.makeGroqRequest(messages);
      return {
        success: true,
        response: response.response,
        model: this.model,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Error in AI chat:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        request: { messageLength: message?.length }
      });
      
      // Return a fallback response in development
      if (process.env.NODE_ENV === 'development') {
        return {
          success: false,
          response: "I'm sorry, the AI service is currently unavailable. This is a development environment issue. Please check your GROQ_API_KEY in the .env file.",
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
      
      throw new Error('AI chat failed: ' + error.message);
    }
  }

  async explainCode(code, language = '') {
    try {
      const prompt = `Explain the following ${language} code in detail. Break down what each part does, explain any complex logic, and provide an example of the expected input/output if applicable.

Code:
\`\`\`${language}
${code}
\`\`\`

Your explanation should be clear and beginner-friendly.`;

      const response = await this.makeGroqRequest([{
        role: 'user',
        content: prompt
      }]);
      return response.response;
    } catch (error) {
      console.error('Error explaining code:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw new Error('Failed to explain code: ' + error.message);
    }
  }

  async generateTestCasesFromCode(code, language = '') {
    try {
      const prompt = `Generate 3-5 test cases for the following ${language} code. For each test case, provide:
1. Input values
2. Expected output
3. A brief explanation of what the test case checks

Code:
\`\`\`${language}
${code}
\`\`\`

Format your response as a JSON array with objects containing 'input', 'output', and 'description' fields.`;

      const response = await this.makeGroqRequest([{
        role: 'user',
        content: prompt
      }]);
      try {
        // Try to parse the response as JSON
        return JSON.parse(response.response);
      } catch (e) {
        // If parsing fails, return the raw response
        console.error('Failed to parse test cases as JSON:', response.response);
        return [{
          input: 'N/A',
          output: 'Could not parse test cases',
          description: 'The AI response could not be parsed as test cases.'
        }];
      }
    } catch (error) {
      console.error('Error generating test cases from code:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw new Error('Failed to generate test cases from code: ' + error.message);
    }
  }
}

const aiService = new AIService();
export default aiService;
