const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

// + since these codes are a static part of the program, we do not store them in our database (we can but it is not the best practice), we can store them in storages like S3 bucket and firebase storage or rightnow, we are just storing them in a separate folder
const dirInputs = path.join(__dirname, "inputs");
if (!fs.existsSync(dirInputs)) {
    fs.mkdirSync(dirInputs, { recursive: true }); // find on your own why we write recursive : true
}

const generateInputFile = (input) => {
    const jobId = uuid(); // generate a unique id so that each file has a different name
    const inputFileName = `${jobId}.txt`;
    const inputFilePath = path.join(dirInputs, inputFileName);
    fs.writeFileSync(inputFilePath, input);

    return inputFilePath;
};

module.exports = generateInputFile;
