// scripts/migrateUsers.js
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', 'backend', '.env') });

async function migrateUsers() {
  // Source database (old)
  const sourceClient = new MongoClient(process.env.SOURCE_MONGODB_URI);
  
  // Target database (new)
  const targetClient = new MongoClient(process.env.MONGODB_URI);

  try {
    await sourceClient.connect();
    await targetClient.connect();

    const sourceDb = sourceClient.db();
    const targetDb = targetClient.db();

    // Get all users from source
    const users = await sourceDb.collection('users').find({}).toArray();
    
    if (users.length === 0) {
      console.log('No users found to migrate');
      return;
    }

    // Insert into target
    const result = await targetDb.collection('users').insertMany(users);
    console.log(`Migrated ${result.insertedCount} users successfully`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sourceClient.close();
    await targetClient.close();
    console.log('Migration completed');
  }
}

migrateUsers();