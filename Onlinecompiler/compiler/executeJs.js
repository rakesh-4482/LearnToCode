const { exec } = require("child_process");

const executeJs = async (filePath, inputFilePath) => {
    return new Promise((resolve, reject) => {
        exec(
            `node "${filePath}" < "${inputFilePath}"`,
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

module.exports = executeJs; 