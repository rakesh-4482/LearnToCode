// makeAdmin.js
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', 'backend', '.env') });

async function makeUserAdmin(email) {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    const result = await db.collection('users').updateOne(
      { email: email },
      { $set: { isAdmin: true } }
    );
    
    if (result.matchedCount === 0) {
      console.log(`❌ User with email ${email} not found`);
    } else if (result.modifiedCount === 1) {
      console.log(`✅ Successfully made ${email} an admin!`);
    } else {
      console.log(`ℹ️ ${email} was already an admin`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
}

// Make krishnamrajugc@gmail.com an admin
makeUserAdmin('krishnamrajugc@gmail.com');