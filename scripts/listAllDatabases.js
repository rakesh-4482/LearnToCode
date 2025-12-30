// listAllDatabases.js
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', 'backend', '.env') });

async function listAllDatabases() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const adminDb = client.db().admin();
    
    // List all databases
    const dbs = await adminDb.listDatabases();
    console.log('Available databases:');
    
    for (const dbInfo of dbs.databases) {
      console.log(`\n📁 Database: ${dbInfo.name}`);
      const db = client.db(dbInfo.name);
      const collections = await db.listCollections().toArray();
      
      if (collections.length > 0) {
        console.log('   Collections:');
        collections.forEach(c => console.log(`   - ${c.name}`));
      } else {
        console.log('   No collections in this database');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
}

listAllDatabases();