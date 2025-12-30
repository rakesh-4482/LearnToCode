import mongoose from 'mongoose';
import Doubt from './models/doubtModel.js';
import { User } from './models/userModel.js';  // Import User model

// Debug information
console.log('=== DEBUG START ===');
console.log('Script started with arguments:', process.argv);
console.log('Environment Variables:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set!');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('Current working directory:', process.cwd());
console.log('=== DEBUG END ===\n');

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

async function checkDoubt(doubtId) {
  try {
    console.log('Connecting to MongoDB...');
    console.log('Using MONGODB_URI:', process.env.MONGODB_URI);
    
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to DB');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected');
    });

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    console.log('Searching for doubt with ID:', doubtId);
    
    // First get the raw doubt without population
    const doubt = await Doubt.findById(doubtId).lean();
      
    if (!doubt) {
      console.log('No doubt found with ID:', doubtId);
    } else {
      console.log('Doubt found:');
      console.log(JSON.stringify(doubt, null, 2));
      console.log('isAnonymous value:', doubt.isAnonymous);
      console.log('Student ID:', doubt.student);
      
      // If you need user details, you can fetch them separately
      if (doubt.student) {
        const user = await User.findById(doubt.student).lean();
        console.log('Student details:', user ? user.username : 'User not found');
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.name === 'CastError') {
      console.log('Error: Invalid doubt ID format');
    } else if (error.name === 'MongooseServerSelectionError') {
      console.log('Error: Could not connect to MongoDB. Check your connection string and network.');
    }
    console.error('Full error:', error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
    process.exit(0);
  }
}

async function listAllDoubts() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('Using MONGODB_URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    console.log('Fetching recent doubts...');
    
    // First get just the basic doubt info without population
    const doubts = await Doubt.find({})
      .select('_id title isAnonymous createdAt student')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    if (doubts.length === 0) {
      console.log('No doubts found in the database');
    } else {
      console.log(`\nFound ${doubts.length} doubts (newest first):`);
      console.log('----------------------------------------');
      
      // Process each doubt one by one to handle user lookups
      for (const doubt of doubts) {
        console.log(`ID: ${doubt._id}`);
        console.log(`Title: ${doubt.title}`);
        console.log(`Created: ${doubt.createdAt}`);
        console.log(`isAnonymous: ${doubt.isAnonymous}`);
        
        // If you need user details, you can fetch them here
        if (doubt.student) {
          const user = await User.findById(doubt.student).lean();
          console.log(`Student: ${user ? user.username : 'User not found'}`);
        } else {
          console.log('Student: No student data');
        }
        
        console.log('----------------------------------------');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
    process.exit(0);
  }
}

// Main execution
if (process.argv[2] === 'list') {
  listAllDoubts();
} else if (process.argv[2]) {
  checkDoubt(process.argv[2]);
} else {
  console.log('Usage:');
  console.log('  MONGODB_URI="your_connection_string" node checkDoubt.js list');
  console.log('  MONGODB_URI="your_connection_string" node checkDoubt.js <doubtId>');
  process.exit(1);
}