const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const outputPath = path.join(__dirname, "compiled_outputs");
if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

const executeC = async (filePath, inputFilePath) => {
    const jobId = path.basename(filePath).split(".")[0];
    const outputFileName = `${jobId}.out`;
    const outPath = path.join(outputPath, outputFileName);

    return new Promise((resolve, reject) => {
        exec(
            `gcc "${filePath}" -o "${outPath}" && cd "${outputPath}" && "./${outputFileName}" < "${inputFilePath}"`,
            (error, stdout, stderr) => {
                if (error) {
                    reject({ error, stderr });
                }
                if (stderr) {
                    reject({ stderr });
                }
                resolve(stdout);
            }
        );
    });
};

module.exports = executeC; 