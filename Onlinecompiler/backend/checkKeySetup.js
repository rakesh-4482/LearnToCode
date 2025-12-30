// backend/checkKeySetup.js
import mongoose from 'mongoose';
import { mongoDBURL } from './config.js';
import { Key } from './models/keyModel.js';

async function checkKeySetup() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoDBURL);
    console.log('✅ Connected to MongoDB');

    // Check all keys in the database
    console.log('\n🔍 Checking all keys in database...');
    const allKeys = await Key.find({});
    console.log(`Found ${allKeys.length} keys in database:`);
    allKeys.forEach((key, index) => {
      console.log(`\nKey ${index + 1}:`, {
        name: key.name,
        type: key.type,
        status: key.status,
        validFrom: key.validFrom,
        validUntil: key.validUntil,
        value: key.value ? '***HIDDEN***' : 'MISSING'
      });
    });

    // Check active key
    console.log('\n🔑 Getting active key...');
    try {
      const activeKey = await Key.getActiveKey('gemini');
      console.log('✅ Active key found:', {
        name: activeKey.name,
        type: activeKey.type,
        status: activeKey.status,
        validFrom: activeKey.validFrom,
        validUntil: activeKey.validUntil
      });
    } catch (error) {
      console.error('❌ Error getting active key:', error.message);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Check failed:', error);
    process.exit(1);
  }
}

checkKeySetup();