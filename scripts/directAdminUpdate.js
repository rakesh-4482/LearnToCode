// directAdminUpdate.js
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', 'backend', '.env') });

const email = 'krishnamrajugc@gmail.com';

async function makeAdmin() {
  const client = new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  });

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected successfully');
    
    const db = client.db();
    const result = await db.collection('users').updateOne(
      { email },
      { $set: { isAdmin: true } }
    );
    
    if (result.matchedCount === 0) {
      console.log('❌ User not found');
    } else if (result.modifiedCount === 1) {
      console.log(`✅ Successfully made ${email} an admin!`);
    } else {
      console.log('ℹ️ User was already an admin');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

makeAdmin();