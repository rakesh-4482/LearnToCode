# AI Features in ByteSmith

This document provides an overview of the AI-powered features in ByteSmith and how to set them up.

## Features

1. **Test Case Generation**
   - Automatically generates test cases for coding problems
   - Supports multiple test case types (sample, edge cases, etc.)
   - Can be added to existing questions

2. **Error Explanation**
   - Explains compilation and runtime errors in beginner-friendly language
   - Provides suggestions for fixing common mistakes
   - Supports multiple programming languages

3. **Learning Recommendations**
   - Personalized suggestions based on user's coding history
   - Identifies weak areas and suggests practice problems
   - Adapts to user's skill level and progress

4. **Code Hints**
   - Provides contextual hints for coding problems
   - Multiple hint levels (subtle to direct)
   - Helps users learn problem-solving strategies

## Setup Instructions

### Prerequisites

1. Node.js 16+ and npm/yarn
2. MongoDB database
3. Google Gemini API key

### Installation

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your configuration:
   ```env
   # Required
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   SESSION_SECRET=your_session_secret
   
   # Optional (with defaults)
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Generate Test Cases
```
POST /api/ai/generate-test-cases
Content-Type: application/json
Authorization: Bearer <token>

{
  "questionId": "60a1b2c3d4e5f6a7b8c9d0e1",
  "numTestCases": 5
}
```

### Explain Error
```
POST /api/ai/explain-error
Content-Type: application/json
Authorization: Bearer <token>

{
  "errorMessage": "SyntaxError: Unexpected token '}'",
  "code": "function test() { return 1; }}",
  "language": "javascript"
}
```

### Get Learning Recommendations
```
GET /api/ai/recommendations
Authorization: Bearer <token>
```

### Generate Hint
```
POST /api/ai/generate-hint
Content-Type: application/json
Authorization: Bearer <token>

{
  "questionId": "60a1b2c3d4e5f6a7b8c9d0e1",
  "userCode": "function test() { return 1; }",
  "hintLevel": 1
}
```

## Rate Limiting

AI endpoints are rate limited to 100 requests per 15 minutes per IP address. If you exceed this limit, you'll receive a 429 status code.

## Error Handling

All API responses follow this format:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error message (in development only)"
}
```

## Testing

To test the AI features, you can use the provided test scripts:

```bash
# Run all tests
npm test

# Run specific test file
npm test test/aiService.test.js
```

## Troubleshooting

1. **API Key Issues**
   - Ensure your Gemini API key is valid and has sufficient quota
   - Check that the `GEMINI_API_KEY` environment variable is set correctly

2. **Connection Issues**
   - Verify MongoDB is running and accessible
   - Check that all required environment variables are set

3. **Rate Limiting**
   - If you're hitting rate limits, consider increasing the limit or implementing caching

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request
