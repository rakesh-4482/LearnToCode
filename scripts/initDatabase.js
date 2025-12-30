// initDatabase.js
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', 'backend', '.env') });

async function initDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    
    // Create collections if they don't exist
    const collections = ['users', 'problems', 'submissions', 'discussions'];
    for (const collection of collections) {
      try {
        await db.createCollection(collection);
        console.log(`✅ Created collection: ${collection}`);
      } catch (err) {
        if (err.codeName === 'NamespaceExists') {
          console.log(`ℹ️ Collection already exists: ${collection}`);
        } else {
          throw err;
        }
      }
    }
    
    // Create admin user
    const users = db.collection('users');
    const adminEmail = 'admin@example.com';
    const adminUser = {
      email: adminEmail,
      name: 'Admin User',
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await users.updateOne(
      { email: adminEmail },
      { $setOnInsert: adminUser },
      { upsert: true }
    );
    
    if (result.upsertedCount > 0) {
      console.log('\n✅ Created admin user:');
      console.log(`- Email: ${adminEmail}`);
      console.log('- Password: You need to set this through the app');
      console.log('\nIMPORTANT: Please change this password after first login!');
    } else {
      console.log('\nℹ️ Admin user already exists');
    }
    
  } catch (error) {
    console.error('Error initializing database:', error.message);
  } finally {
    await client.close();
  }
}

initDatabase();