import mongoose from "mongoose";
import slugify from "slugify";

const testCaseSchema = new mongoose.Schema({
    input: { type: String, required: true },
    output: { type: String, required: true },
});

const questionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        author: {
            type: String,
            required: true,
        },
        problemStatement: {
            type: String,
            required: true,
        },
        topics: {
            type: [String], // Array of strings
            validate: {
                validator: function (arr) {
                    return arr.length <= 3;
                },
                message: "You can specify up to 3 topics only.",
            },
            default: [], // Optional: Default to empty array if not provided
        },
        difficulty: {
            type: String,
            required: true,
            enum: ["noob", "easy", "medium", "hard", "god"], // Only these values allowed
            lowercase: true, // Ensures case-insensitive input
            trim: true, // Removes extra whitespace
        },
        constraints: { type: String },
        examples: {
            type: [
                {
                    input: { type: String, required: true },
                    output: { type: String, required: true },
                    explanation: { type: String, required: true },
                },
            ],
            default: [],
        },

        publicTestCases: {
            type: [testCaseSchema],
            default: [],
            validate: {
                validator: function (tc) {
                    return tc.length >= 1 && tc.length <= 5;
                },
                message: "You must provide between 1 and 5 public test cases.",
            },
        },
        hiddenTestCases: [testCaseSchema],
    },
    {
        timestamps: true,
    }
);

// we cannot store slugs as virtuals coz we will be using it in routes as params
// virtuals are compute at runtime and thus cannot be used in routes.

// This is an auto slug generator and is capable of generating separate slugs for even vey similar titles like : "two sum" and "two Sum"
questionSchema.pre("validate", async function (next) {
    if (!this.title) return next();

    let baseSlug = slugify(this.title, { lower: true, strict: true });
    let slug = baseSlug;
    let count = 1;

    while (await mongoose.models.Question.exists({ slug })) {
        slug = `${baseSlug}-${count++}`;
    }

    this.slug = slug;
    next();
});

export const Question = mongoose.model("Question", questionSchema);
