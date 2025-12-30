import express from "express";
import { Question } from "../models/questionModel.js";

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: "Questions API is working!" });
});

// # Create a new question
router.post("/", async (req, res) => {
    const {
        title,
        author,
        problemStatement,
        difficulty,
        topics,
        constraints,
        examples,
        publicTestCases,
        hiddenTestCases,
    } = req.body;

    if (!title || !author || !problemStatement || !difficulty) {
        return res.status(400).json({
            message:
                "Required fields: title, author, problemStatement, difficulty",
        });
    }

    try {
        const newQuestion = new Question({
            title,
            author,
            problemStatement,
            difficulty,
            topics,
            constraints,
            examples,
            publicTestCases,
            hiddenTestCases,
        });

        const savedQuestion = await newQuestion.save();
        res.status(201).json(savedQuestion);
    } catch (err) {
        if (err.code === 11000) {
            return res
                .status(409)
                .json({ message: "Duplicate title or slug exists" });
        }
        res.status(500).json({ message: "Server Error" });
    }
});

// # GET all questions with pagination and search
router.get("/", async (req, res) => {
    const { page = 1, limit = 10, search = "", difficulty, topic } = req.query;

    const pageNum = Math.max(parseInt(page) || 1, 1); // Min page 1
    const limitNum = Math.min(parseInt(limit) || 10, 100); // Max 100 per page
    const skip = (pageNum - 1) * limitNum;

    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Escape special regex characters: (avoiding mongodb injection)
    const regex = new RegExp(escapedSearch, "i");

    try {
        const query = {
            ...(search
                ? {
                      $or: [
                          { title: regex },
                          { topics: regex },
                          { author: regex },
                      ],
                  }
                : {}), // Empty object = no filter = return all documents (just optimisation, minor hi sahi)
            ...(difficulty && difficulty !== "all" && { difficulty }),
            ...(topic && topic !== "all" && { topics: topic }),
        };

        const total = await Question.countDocuments(query);
        const questions = await Question.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        // Exclude hiddenTestCases from list
        const sanitized = questions.map((q) => {
            const { hiddenTestCases, ...rest } = q.toObject();
            return rest;
        });

        // a more descriptive message when no questions are found (optional UX)
        if (sanitized.length === 0) {
            return res.status(200).json({
                total: 0,
                currentPage: pageNum,
                totalPages: 0,
                data: [],
                message: "No matching questions found.",
            });
        }

        res.status(200).json({
            total,
            currentPage: pageNum, // Instead of Number(page)
            totalPages: Math.ceil(total / limitNum), // parsed number
            data: sanitized,
        });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// # Get one question by slug (excludes hidden test cases)
router.get("/slug/:slug", async (req, res) => {
    try {
        const question = await Question.findOne({ slug: req.params.slug });

        if (!question)
            return res.status(404).json({ message: "Question not found" });

        const { hiddenTestCases, ...rest } = question.toObject();
        res.status(200).json(rest);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// # Get one question by ID (includes hidden test cases)
router.get("/:id", async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question)
            return res.status(404).json({ message: "Question not found" });
        res.status(200).json(question);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// # Update a question by ID
router.put("/:id", async (req, res) => {
    try {
        // Prevent title updates (due to slug regenation issues)
        if (req.body.title) {
            return res.status(400).json({
                message:
                    "Title cannot be updated once the question is created.",
            });
        }

        const updated = await Question.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updated)
            return res.status(404).json({ message: "Question not found" });

        res.status(200).json({ message: "Question updated", data: updated });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// # Delete a question by ID
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await Question.findByIdAndDelete(req.params.id);
        if (!deleted)
            return res.status(404).json({ message: "Question not found" });

        res.status(200).json({ message: "Question deleted" });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

export default router;
