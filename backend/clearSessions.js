import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const clearSessions = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB');

        // Get the sessions collection
        const db = mongoose.connection.db;
        const collections = await db.listCollections({ name: 'sessions' }).toArray();
        
        if (collections.length > 0) {
            // Drop the sessions collection
            await db.dropCollection('sessions');
            console.log('Successfully dropped the sessions collection');
        } else {
            console.log('Sessions collection does not exist');
        }

        // Close the connection
        await mongoose.connection.close();
        console.log('Connection closed');
    } catch (error) {
        console.error('Error clearing sessions:', error);
        process.exit(1);
    }
};

clearSessions();
