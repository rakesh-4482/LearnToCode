// listCollections.js
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', 'backend', '.env') });

async function listCollections() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const collections = await client.db().listCollections().toArray();
    console.log('Available collections:');
    collections.forEach(c => console.log(`- ${c.name}`));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
}

listCollections();