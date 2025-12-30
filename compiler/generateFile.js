const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

// + since these codes are a static part of the program, we do not store them in our database (we can but it is not the best practice), we can store them in storages like S3 bucket and firebase storage or rightnow, we are just storing them in a separate folder
const dirCodes = path.join(__dirname, "codes"); // will add '/codes' to the path of the current file's directory (generateFile.js jis directory me hai)
// if the above path does not exist, then create a directory with this particular path
if (!fs.existsSync(dirCodes)) {
    fs.mkdirSync(dirCodes, { recursive: true }); // find on your own why we write recursive : true
}

const generateFile = (language, code) => {
    const jobId = uuid(); // generate a unique id so that each file has a different name
    const fileName = `${jobId}.${language}`; // concatenating obid with the language extension
    const filePath = path.join(dirCodes, fileName); // generate the path for this file
    fs.writeFileSync(filePath, code); // write the code in the file with given path

    return filePath;
};

module.exports = generateFile;
