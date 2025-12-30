import mongoose from 'mongoose';
import slugify from 'slugify';
import Problem from '../models/problemModel.js';
import { mongoDBURL } from '../config.js';

// Connect to MongoDB
mongoose.connect(mongoDBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
    console.log('Connected to MongoDB');
    
    try {
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
        console.error('Error updating problem slugs:', error);
        process.exit(1);
    }
});
