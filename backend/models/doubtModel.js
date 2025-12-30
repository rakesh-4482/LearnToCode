import mongoose from "mongoose";

const { Schema, model } = mongoose;

const responseSchema = new Schema({
    user: { 
        type: Schema.Types.ObjectId, 
        ref: "User",
        required: true 
    },
    content: { 
        type: String, 
        required: true 
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    votes: {
        type: Number,
        default: 0
    },
    voters: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        voteType: {
            type: String,
            enum: ['up', 'down']
        }
    }],
    isSolution: {
        type: Boolean,
        default: false
    },
    solutionMarkedAt: {
        type: Date
    },
    solutionMarkedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

const doubtSchema = new Schema(
    {
        title: { 
            type: String, 
            required: true,
            trim: true,
            maxlength: 200
        },
        content: { 
            type: String, 
            required: true,
            trim: true
        },
        student: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        isAnonymous: { 
            type: Boolean, 
            default: false 
        },
        isPublic: { 
            type: Boolean, 
            default: true, // Changed default to true for the forum-style approach
            index: true
        },
        isResolved: { 
            type: Boolean, 
            default: false,
            index: true
        },
        tags: [{
            type: String,
            trim: true,
            lowercase: true
        }],
        views: {
            type: Number,
            default: 0
        },
        votes: {
            type: Number,
            default: 0
        },
        voters: [{
            userId: {
                type: Schema.Types.ObjectId,
                ref: "User"
            },
            voteType: {
                type: String,
                enum: ['up', 'down']
            }
        }],
        answers: [responseSchema],
        acceptedAnswer: {
            type: Schema.Types.ObjectId,
            ref: "Response"
        },
        lastActivity: {
            type: Date,
            default: Date.now
        }
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Indexes for better query performance
doubtSchema.index({ title: 'text', content: 'text' });
doubtSchema.index({ tags: 1 });
doubtSchema.index({ student: 1, createdAt: -1 });
doubtSchema.index({ isResolved: 1, createdAt: -1 });

// Virtual for answer count
doubtSchema.virtual('answerCount').get(function() {
    return this.answers.length;
});

// Pre-save hook to update lastActivity
doubtSchema.pre('save', function(next) {
    if (this.isModified('answers') || this.isModified('isResolved')) {
        this.lastActivity = new Date();
    }
    next();
});

// Method to add a vote to a doubt
doubtSchema.methods.addVote = async function(userId, voteType) {
    const voteIndex = this.voters.findIndex(v => v.userId.equals(userId));
    
    if (voteIndex > -1) {
        // User has already voted
        if (this.voters[voteIndex].voteType === voteType) {
            // Remove vote if clicking the same button again
            this.votes -= voteType === 'up' ? 1 : -1;
            this.voters.splice(voteIndex, 1);
        } else {
            // Change vote
            this.votes += voteType === 'up' ? 2 : -2;
            this.voters[voteIndex].voteType = voteType;
        }
    } else {
        // New vote
        this.votes += voteType === 'up' ? 1 : -1;
        this.voters.push({ userId, voteType });
    }
    
    await this.save();
    return this;
};

// Method to add an answer
doubtSchema.methods.addAnswer = async function(answerData) {
    this.answers.push(answerData);
    this.lastActivity = new Date();
    return this.save();
};

// Method to mark an answer as solution
doubtSchema.methods.markAsSolution = async function(answerId, userId) {
    const answer = this.answers.id(answerId);
    if (!answer) {
        throw new Error('Answer not found');
    }
    
    // If already marked as solution, unmark it
    if (answer.isSolution) {
        answer.isSolution = false;
        answer.solutionMarkedAt = undefined;
        answer.solutionMarkedBy = undefined;
        this.isResolved = false;
    } else {
        // Mark as solution
        answer.isSolution = true;
        answer.solutionMarkedAt = new Date();
        answer.solutionMarkedBy = userId;
        this.isResolved = true;
        
        // Unmark any other solutions
        this.answers.forEach(a => {
            if (a._id.toString() !== answerId && a.isSolution) {
                a.isSolution = false;
                a.solutionMarkedAt = undefined;
                a.solutionMarkedBy = undefined;
            }
        });
    }
    
    return this.save();
};

const Doubt = model("Doubt", doubtSchema);

export default Doubt;
