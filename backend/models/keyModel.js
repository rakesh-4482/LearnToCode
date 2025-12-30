import mongoose from 'mongoose';
import crypto from 'crypto';

// Simple in-memory key storage for development
const developmentKeys = new Map();

const keySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    // Store encrypted value in production, plaintext in development
    value: {
        type: String,
        required: true,
        select: false // Never return this field by default
    },
    type: {
        type: String,
        enum: ['gemini', 'other'],
        required: true,
        default: 'gemini'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'revoked'],
        default: 'active'
    },
    validFrom: {
        type: Date,
        default: Date.now
    },
    validUntil: {
        type: Date,
        required: true
    },
    metadata: {
        type: Map,
        of: String,
        default: {}
    },
    createdBy: {
        type: String,
        default: 'system'
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            // Never expose the key value in API responses
            delete ret.value;
            return ret;
        }
    }
});

// Indexes
keySchema.index({ type: 1, status: 1 });
keySchema.index({ validUntil: 1 }, { expireAfterSeconds: 0 });

// Static method to get current active key
keySchema.statics.getActiveKey = async function(type = 'gemini') {
    if (process.env.NODE_ENV === 'development') {
        // In development, use in-memory storage
        const activeKey = developmentKeys.get('active');
        if (!activeKey) {
            throw new Error('No active key found. Please initialize a key first.');
        }
        return activeKey;
    }
    
    // In production, get from database
    return this.findOne({ 
        type, 
        status: 'active',
        validFrom: { $lte: new Date() },
        validUntil: { $gt: new Date() }
    }).sort({ validUntil: -1 });
};

// Static method to set active key (development only)
keySchema.statics.setActiveKey = async function(keyData) {
    if (process.env.NODE_ENV === 'development') {
        developmentKeys.set('active', {
            ...keyData,
            _id: 'dev-key-123',
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return developmentKeys.get('active');
    }
    
    throw new Error('setActiveKey is only available in development mode');
};

export const Key = mongoose.model('Key', keySchema);
