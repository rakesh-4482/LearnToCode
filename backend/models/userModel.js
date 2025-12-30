import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        bio: {
            type: String,
            maxlength: 500,
        },
        avatar: {
            type: String,
            default: "",
        },
        isTeacher: {
            type: Boolean,
            default: false,
        },
        solvedProblems: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Question",
            },
        ],
        submissionsCount: {
            type: Number,
            default: 0,
        },
        rating: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model("User", userSchema);
