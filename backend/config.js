// backend/config.js
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const PORT = process.env.PORT || 3000;
export const mongoDBURL = process.env.MONGODB_URI; // Removed hardcoded URI

// Make sure to set MONGODB_URI in your .env file