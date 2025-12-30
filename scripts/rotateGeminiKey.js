#!/usr/bin/env node

import dotenv from 'dotenv';
import keyManager from '../backend/services/keyManager.js';
import { connectDB } from '../backend/config/database.js';

// Load environment variables
dotenv.config();

async function rotateKey() {
    try {
        const newKey = process.env.NEW_GEMINI_API_KEY;
        
        if (!newKey) {
            throw new Error('NEW_GEMINI_API_KEY environment variable is required');
        }

        console.log(' Starting Gemini API key rotation...');
        
        // Connect to database
        await connectDB();
        
        // Rotate the key
        const rotatedKey = await keyManager.rotateKey(newKey, {
            rotatedBy: process.env.USER || 'script',
            environment: process.env.NODE_ENV || 'development',
            rotationType: 'manual'
        });

        console.log('\n Key rotation completed successfully!');
        console.log('\nKey Details:');
        console.log(`  - Name: ${rotatedKey.name}`);
        console.log(`  - Status: ${rotatedKey.status}`);
        console.log(`  - Valid From: ${rotatedKey.validFrom}`);
        console.log(`  - Valid Until: ${rotatedKey.validUntil}`);
        console.log(`  - Environment: ${rotatedKey.metadata?.environment || 'N/A'}`);
        
        process.exit(0);
        
    } catch (error) {
        console.error('\n Key rotation failed:', error.message);
        if (process.env.DEBUG) {
            console.error('\nDebug info:', error);
        }
        process.exit(1);
    }
}

// Run the rotation
rotateKey();
