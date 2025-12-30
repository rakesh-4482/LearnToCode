const userQuestionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            required: true,
        },
        status: {
            type: String,
            enum: ["solved", "attempted", "bookmarked"],
            default: "attempted",
        },
        bestSubmission: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Submission",
        },
        attemptsCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);
