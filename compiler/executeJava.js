const { exec } = require("child_process");
const path = require("path");

const executeJava = async (filePath, inputFilePath) => {
    const dir = path.dirname(filePath);
    const fileName = path.basename(filePath);
    const className = fileName.split(".")[0];

    return new Promise((resolve, reject) => {
        exec(
            `javac "${filePath}" && cd "${dir}" && java ${className} < "${inputFilePath}"`,
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

module.exports = executeJava; 