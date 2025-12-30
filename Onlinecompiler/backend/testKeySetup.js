// backend/testKeySetup.js
import { Key } from './models/keyModel.js';
import mongoose from 'mongoose';
import { mongoDBURL } from './config.js';

async function testKeySetup() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoDBURL);
    console.log('✅ Connected to MongoDB');

    // Check existing keys
    console.log('🔍 Checking for existing keys...');
    const existingKeys = await Key.find({});
    console.log(`Found ${existingKeys.length} keys in database`);

    // Try to get active key
    console.log('\n🔑 Getting active key...');
    try {
      const activeKey = await Key.getActiveKey('gemini');
      console.log('✅ Active key found:', {
        name: activeKey.name,
        type: activeKey.type,
        validUntil: activeKey.validUntil
      });
    } catch (error) {
      console.error('❌ Error getting active key:', error.message);
    }

    // Try to set a new key
    console.log('\n🔄 Setting new test key...');
    try {
      await Key.setActiveKey({
        name: 'test-gemini-key',
        value: 'test-key-value',
        type: 'gemini',
        validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
        metadata: {
          environment: 'development',
          createdBy: 'test-script'
        }
      });
      console.log('✅ Test key set successfully');
    } catch (error) {
      console.error('❌ Error setting test key:', error.message);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testKeySetup();