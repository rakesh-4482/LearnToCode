import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from '../backend/models/problemModel.js';

dotenv.config();

async function checkDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        // Count total problems
        const totalProblems = await Problem.countDocuments();
        console.log(`📊 Total problems in database: ${totalProblems}`);

        if (totalProblems > 0) {
            // Get first 5 problems as sample
            const sampleProblems = await Problem.find({})
                .select('title slug difficulty')
                .limit(5)
                .lean();
            
            console.log('\nSample problems:');
            console.table(sampleProblems);
            
            // Check if any problems are missing slugs
            const problemsWithoutSlugs = await Problem.find({ 
                $or: [
                    { slug: { $exists: false } },
                    { slug: { $eq: '' } },
                    { slug: { $eq: null } }
                ]
            }).countDocuments();
            
            if (problemsWithoutSlugs > 0) {
                console.warn(`\n⚠️  Found ${problemsWithoutSlugs} problems without slugs!`);
            }
        }

    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error.message);
        if (error.code === 'MONGODB_URI_ERROR') {
            console.error('Please check your MONGODB_URI in .env file');
        }
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

checkDatabase();
