// listUsers.js
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', 'backend', '.env') });

async function listUsers() {
  const client = new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  });

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected successfully');
    
    const db = client.db();
    const users = await db.collection('users').find({}).toArray();
    
    console.log('\n📋 Users in database:');
    if (users.length === 0) {
      console.log('No users found in the database');
    } else {
      users.forEach((user, index) => {
        console.log(`\nUser ${index + 1}:`);
        console.log(`- ID: ${user._id}`);
        console.log(`- Email: ${user.email || 'No email'}`);
        console.log(`- Username: ${user.username || 'No username'}`);
        console.log(`- Admin: ${user.isAdmin ? '✅ Yes' : '❌ No'}`);
        console.log('---');
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
    console.log('\nConnection closed');
  }
}

listUsers();