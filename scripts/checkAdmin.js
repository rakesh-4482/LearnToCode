import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Enable Mongoose debug mode
mongoose.set('debug', true);

// Load environment variables from the backend/.env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', 'backend', '.env');
const envConfig = dotenv.config({ path: envPath });

if (envConfig.error) {
  console.error('❌ Error loading .env file:', envConfig.error);
  process.exit(1);
}

// Log environment variables (excluding sensitive data)
console.log('Environment Variables:');
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`- MONGODB_URI: ${process.env.MONGODB_URI ? '✅ Found' : '❌ Missing'}`);

// Parse the MongoDB URI to get connection details
let mongoUri;
if (process.env.MONGODB_URI) {
  try {
    mongoUri = new URL(process.env.MONGODB_URI);
    console.log('  - Host:', mongoUri.hostname);
    console.log('  - Database:', mongoUri.pathname.split('/').pop() || 'default');
    console.log('  - Using SSL:', mongoUri.searchParams.get('ssl') === 'true');
  } catch (e) {
    console.error('  - ❌ Invalid MongoDB URI format');
  }
}

// Import User model using dynamic import
const { User } = await import('../backend/models/userModel.js');

const checkAdmin = async (email) => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in backend/.env file');
    }

    console.log('\n🔌 Connecting to MongoDB...');
    
    // MongoDB connection options with SSL
    const options = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 1,
      retryWrites: true,
      w: 'majority',
      ssl: true,
      sslValidate: true,
      authSource: 'admin'
    };

    console.log('Connection options:', JSON.stringify(options, null, 2));
    
    // Enable debug logging for Mongoose
    mongoose.set('debug', (collectionName, method, query, doc) => {
      console.log(`Mongoose: ${collectionName}.${method}`, JSON.stringify(query));
    });

    // Connect to MongoDB
    console.log('\n🔍 Attempting to connect to MongoDB...');
    const startTime = Date.now();
    
    try {
      await mongoose.connect(process.env.MONGODB_URI, options);
      console.log(`✅ MongoDB connected successfully in ${Date.now() - startTime}ms`);
      
      // List all collections to verify access
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('\n📂 Available collections:');
      collections.forEach(c => console.log(`- ${c.name}`));
      
    } catch (connectError) {
      console.error('\n❌ MongoDB connection error:', connectError.message);
      if (connectError.errors) {
        console.error('Validation errors:', connectError.errors);
      }
      throw connectError;
    }

    console.log('\n🔍 Finding user...');
    try {
      const user = await User.findOne({ email })
        .select('email isAdmin')
        .maxTimeMS(30000)
        .lean();

      if (!user) {
        console.error('❌ User not found');
        process.exit(1);
      }

      console.log('\n🔍 User found:');
      console.log(`📧 Email: ${user.email}`);
      console.log(`👑 Admin: ${user.isAdmin ? '✅ Yes' : '❌ No'}`);
      
      if (!user.isAdmin) {
        console.log('\nTo make this user an admin, run:');
        console.log(`   node scripts/makeAdmin.js ${email}\n`);
      }
      
    } catch (queryError) {
      console.error('\n❌ Query error:', queryError.message);
      if (queryError.code) {
        console.error('Error code:', queryError.code);
      }
      throw queryError;
    }
    
  } catch (error) {
    console.error('\n❌ Error checking admin status:');
    console.error(error.stack || error.message);
    
    console.error('\n💡 Troubleshooting steps:');
    console.error('1. Verify MongoDB Atlas cluster is running and accessible');
    console.error('2. Check if your IP is whitelisted in MongoDB Atlas Network Access');
    console.error('3. Verify the database name in MONGODB_URI matches your cluster');
    console.error('4. Try connecting with MongoDB Compass using the same connection string');
    console.error('5. Check MongoDB Atlas logs for connection attempts');
    
    if (process.env.MONGODB_URI) {
      console.error('\nCurrent MongoDB URI:', process.env.MONGODB_URI);
    }
    
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔌 MongoDB connection closed');
    }
  }
};

// Get email from command line arguments
const email = process.argv[2];
if (!email) {
  console.error('\n❌ Please provide an email address');
  console.log('\nUsage: node scripts/checkAdmin.js user@example.com\n');
  process.exit(1);
}

checkAdmin(email);
