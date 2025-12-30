import mongoose from 'mongoose';
import slugify from 'slugify';

const testCaseSchema = new mongoose.Schema({
    input: {
        type: String,
        required: true
    },
    expectedOutput: {
        type: String,
        required: true
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    explanation: {
        type: String,
        default: ''
    }
}, { _id: false });

const exampleSchema = new mongoose.Schema({
    input: {
        type: String,
        required: true
    },
    output: {
        type: String,
        required: true
    },
    explanation: {
        type: String
    }
}, { _id: false });

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    category: {
        type: [String],
        required: true
    },
    tags: {
        type: String,
        default: "",
        index: 'text'
    },
    functionSignature: {
        name: String,
        params: [{
            name: String,
            type: String
        }],
        returnType: String
    },
    starterCode: {
        type: Map,
        of: String,
        default: {}
    },
    examples: [exampleSchema],
    testCases: [testCaseSchema],
    constraints: [String],
    hints: [String],
    totalSubmissions: {
        type: Number,
        default: 0
    },
    acceptedSubmissions: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
problemSchema.index({ title: 'text', description: 'text', tags: 'text', category: 1, difficulty: 1 });

// Virtual for acceptance rate
problemSchema.virtual('acceptanceRate').get(function() {
    return this.totalSubmissions > 0 
        ? Math.round((this.acceptedSubmissions / this.totalSubmissions) * 100) 
        : 0;
});

// Generate slug from title before saving
problemSchema.pre('save', function(next) {
    if (this.isModified('title') || !this.slug) {
        this.slug = slugify(this.title, {
            lower: true,
            strict: true,
            remove: /[*+~.()'"!:@]/g
        });
    }
    this.updatedAt = Date.now();
    next();
});

// Make sure the slug is unique
problemSchema.pre('save', async function(next) {
    if (!this.isModified('slug')) return next();
    
    const existing = await this.constructor.findOne({ 
        slug: this.slug,
        _id: { $ne: this._id }
    });
    
    if (existing) {
        const err = new Error('Slug must be unique');
        return next(err);
    }
    
    next();
});

// Check if model has already been compiled
let Problem;
try {
    Problem = mongoose.model('Problem');
} catch (e) {
    Problem = mongoose.model('Problem', problemSchema);
}

export default Problem;