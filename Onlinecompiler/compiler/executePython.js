const { exec } = require("child_process");

const executePython = async (filePath, inputFilePath) => {
    return new Promise((resolve, reject) => {
        exec(
            `python3 "${filePath}" < "${inputFilePath}"`,
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

module.exports = executePython; 