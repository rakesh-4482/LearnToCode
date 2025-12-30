// backend/initDevKey.js
import { Key } from './models/keyModel.js';
import mongoose from 'mongoose';
import { mongoDBURL } from './config.js';

async function initDevKey() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoDBURL);
    console.log('Connected to MongoDB');

    // Initialize development API key
    await Key.setActiveKey({
      name: 'dev-gemini-key',
      value: 'YOUR_GEMINI_API_KEY', // Replace with your actual Gemini API key
      type: 'gemini',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      metadata: {
        environment: 'development',
        createdBy: 'initDevKey script',
        note: 'This is a development key. Replace with a real key in production.'
      }
    });
    
    console.log('✅ Development API key initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to initialize development API key:', error);
    process.exit(1);
  }
}

initDevKey();
