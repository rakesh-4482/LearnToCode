import 'dotenv/config';
import mongoose from 'mongoose';

console.log('Testing MongoDB connection...');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Found (first 50 chars shown): ' + process.env.MONGODB_URI.substring(0, 50) + '...' : 'Not found');

async function testConnection() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        console.log('✅ Successfully connected to MongoDB!');
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));
        process.exit(0);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        console.error('Error details:', error);
        process.exit(1);
    }
}

testConnection();
