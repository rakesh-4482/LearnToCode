// checkSampleUsers.js
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', 'backend', '.env') });

async function checkSampleUsers() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('sample_mflix');
    const users = await db.collection('users').find({}).limit(5).toArray();
    
    console.log('Sample users from sample_mflix database:');
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log(`- ID: ${user._id}`);
      console.log(`- Name: ${user.name || 'N/A'}`);
      console.log(`- Email: ${user.email || 'N/A'}`);
      console.log(`- Admin: ${user.isAdmin ? '✅' : '❌'}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
}

checkSampleUsers();