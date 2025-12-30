// findUsersEverywhere.js
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', 'backend', '.env') });

async function findAllUsers() {
  const client = new MongoClient(process.env.MONGODB_URI.replace(/\/[^/]*$/, '')); // Remove database name
  try {
    await client.connect();
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    
    for (const dbInfo of dbs.databases) {
      if (['admin', 'local', 'config'].includes(dbInfo.name)) continue;
      
      console.log(`\n🔍 Searching database: ${dbInfo.name}`);
      const db = client.db(dbInfo.name);
      const collections = await db.listCollections().toArray();
      
      for (const coll of collections) {
        try {
          const collection = db.collection(coll.name);
          const users = await collection.find({ 
            $or: [
              { email: { $exists: true } },
              { username: { $exists: true } }
            ] 
          }).limit(5).toArray();
          
          if (users.length > 0) {
            console.log(`\n📦 Found users in ${dbInfo.name}.${coll.name}:`);
            users.forEach((user, i) => {
              console.log(`  User ${i + 1}:`);
              console.log(`  - ID: ${user._id}`);
              console.log(`  - Email: ${user.email || 'N/A'}`);
              console.log(`  - Username: ${user.username || 'N/A'}`);
              if (user.isAdmin !== undefined) console.log(`  - Admin: ${user.isAdmin ? '✅' : '❌'}`);
              console.log('  ---');
            });
          }
        } catch (err) {
          console.log(`  ⚠️ Couldn't search ${dbInfo.name}.${coll.name}: ${err.message}`);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
}

findAllUsers();