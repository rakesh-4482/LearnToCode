import 'dotenv/config';
import mongoose from 'mongoose';

// Import the Problem model
import Problem from '../models/problemModel.js';

async function main() {
    console.log('Connecting to MongoDB...');
    
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });

        console.log('Connected to MongoDB');
        
        // Find all problems without a slug or with an empty slug
        const problems = await Problem.find({
            $or: [
                { slug: { $exists: false } },
                { slug: { $in: [null, ''] } }
            ]
        });

        console.log(`Found ${problems.length} problems without slugs`);

        let updatedCount = 0;
        
        // Update each problem with a slug
        for (const problem of problems) {
            const slug = problem.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with -
                .replace(/(^-|-$)/g, '');    // Remove leading/trailing -

            // Check if the slug is already taken
            let uniqueSlug = slug;
            let counter = 1;
            
            while (true) {
                const existing = await Problem.findOne({
                    slug: uniqueSlug,
                    _id: { $ne: problem._id }
                });
                
                if (!existing) break;
                
                uniqueSlug = `${slug}-${counter}`;
                counter++;
            }

            problem.slug = uniqueSlug;
            await problem.save();
            updatedCount++;
            
            console.log(`Updated problem: ${problem.title} -> ${problem.slug}`);
        }

        console.log(`\nSuccessfully updated ${updatedCount} problems with slugs`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        if (error.name === 'MongooseServerSelectionError') {
            console.error('\nCould not connect to MongoDB. Please check:');
            console.error('1. Your internet connection');
            console.error('2. Your MongoDB Atlas IP whitelist');
        }
        process.exit(1);
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        }
    }
}

main().catch(console.error);
