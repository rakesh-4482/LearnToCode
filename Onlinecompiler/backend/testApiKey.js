// Simple test script to verify Groq API key
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function testApiKey() {
  try {
    console.log('🔑 Testing Groq API Key...');
    
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not found in .env file');
    }
    
    console.log('✅ API Key found in environment');
    
    console.log('📤 Testing API with simple request...');
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{
          role: 'user',
          content: 'Say "Hello, ByteSmith!" in a friendly way.'
        }],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from Groq API');
    }

    console.log('✅ API Test Successful!');
    console.log('Response:', data.choices[0].message.content);
    console.log('Model used:', data.model);
    console.log('Usage:', data.usage);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
    console.log('\n📝 To fix this:');
    console.log('1. Go to https://console.groq.com/keys');
    console.log('2. Create a free account');
    console.log('3. Generate an API key');
    console.log('4. Add GROQ_API_KEY=your_key_here to your .env file');
    process.exit(1);
  }
}

testApiKey();
