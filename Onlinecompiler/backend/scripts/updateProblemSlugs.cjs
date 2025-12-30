require('dotenv').config();
const mongoose = require('mongoose');
const slugify = require('slugify');

// Import the Problem model using dynamic import
let Problem;

async function main() {
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
        console.error('Error: MONGODB_URI is not set in environment variables');
        console.log('Please make sure you have a .env file with MONGODB_URI in your backend directory');
        process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    
    try {
        // Import the Problem model using dynamic import
        const problemModule = await import('../models/problemModel.js');
        Problem = problemModule.default;

        // Connect to MongoDB with retry logic
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // 5 second timeout
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
            const slug = slugify(problem.title, {
                lower: true,
                strict: true,
                remove: /[*+~.()'"!:@]/g
            });

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
            console.error('3. That your MONGODB_URI is correct in your .env file');
        }
        process.exit(1);
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        }
    }
}

main().catch(console.error);
