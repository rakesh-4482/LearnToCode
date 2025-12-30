const express = require("express");
const cors = require("cors");
const generateFile = require("./generateFile");
const generateInputFile = require("./generateInputFile");
const executeCpp = require("./executeCpp");
const executeC = require("./executeC");
const executePython = require("./executePython");
const executeJava = require("./executeJava");
const executeJs = require("./executeJs");
const app = express();
const fs = require("fs");
const path = require("path");
require("dotenv").config();

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("hello world");
});

app.post("/run", async (req, res) => {
    const { code, language = "cpp", input } = req.body;
    if (code === undefined) {
        return res
            .status(400)
            .json({ success: false, error: "empty code body" });
    }

    const filePath = generateFile(language, code);
    const inputFilePath = generateInputFile(input || "");
    let output = "";
    let error = null;
    try {
        switch (language) {
            case "cpp":
                output = await executeCpp(filePath, inputFilePath);
                break;
            case "c":
                output = await executeC(filePath, inputFilePath);
                break;
            case "python":
            case "py":
                output = await executePython(filePath, inputFilePath);
                break;
            case "java":
                output = await executeJava(filePath, inputFilePath);
                break;
            case "js":
            case "javascript":
                output = await executeJs(filePath, inputFilePath);
                break;
            default:
                throw new Error("Unsupported language");
        }
        res.json({ output });
    } catch (err) {
        error = err.stderr || err.error || err.message || "Unknown error";
        res.status(500).json({ success: false, error });
    } finally {
        // Cleanup generated files
        try {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
            // Clean up compiled outputs for C/C++
            const jobId = path.basename(filePath).split(".")[0];
            const outPath = path.join(__dirname, "compiled_outputs", `${jobId}.out`);
            if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
            // Clean up .class files for Java
            const classFile = path.join(path.dirname(filePath), `${jobId}.class`);
            if (fs.existsSync(classFile)) fs.unlinkSync(classFile);
        } catch (cleanupErr) {
            console.error("Cleanup error:", cleanupErr.message);
        }
    }
});

app.listen(8000, () => {
    console.log("Server is running on port 8000");
});
