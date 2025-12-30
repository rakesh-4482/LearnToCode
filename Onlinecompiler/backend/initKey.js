// backend/initKey.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Key } from './models/keyModel.js';

// Load environment variables first
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function initializeKey() {
  try {
    console.log('🔑 Using GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '*** (exists) ***' : 'NOT FOUND');
    
    // Always use in-memory storage in development
    console.log('🔄 Setting up development key in memory...');
    const keyData = {
      name: 'gemini-api-key',
      value: process.env.GEMINI_API_KEY || 'test-key-123',
      type: 'gemini',
      status: 'active',
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      metadata: {
        createdBy: 'setup-script',
        environment: 'development'
      }
    };

    // Set the key in memory
    await Key.setActiveKey(keyData);
    console.log('✅ Development key set in memory');

    // Verify the key is accessible
    try {
      const activeKey = await Key.getActiveKey('gemini');
      console.log('✅ Active key verified:', {
        name: activeKey.name,
        type: activeKey.type,
        status: activeKey.status
      });
      console.log('✅ Key is valid until:', activeKey.validUntil);
    } catch (error) {
      console.error('❌ Failed to verify active key:', error.message);
      throw error;
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Initialization failed:', error.message);
    console.error('Error details:', {
      name: error.name,
      code: error.code,
      keyValue: error.keyValue,
      errors: error.errors
    });
    process.exit(1);
  }
}

initializeKey();