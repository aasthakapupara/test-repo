const multer = require("multer");
const path = require("path");

const resultStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "test_results") {
            cb(null, "uploads/test_results");
        }
        else if (file.fieldname === "marksheet") {
            cb(null, "uploads/marksheet");
        }
        else if (file.fieldname === "answersheet") {
            cb(null, "uploads/answersheet");
        }
        else {
            cb(new Error("Invalid file field"), false);
        }
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueName + path.extname(file.originalname));
    }
});


const csvStorage = multer.memoryStorage();

const csvFileFilter = (req, file, cb) => {
    if (
        file.mimetype === "text/csv" ||
        file.mimetype === "application/vnd.ms-excel"
    ) {
        cb(null, true);
    } else {
        cb(new Error("Only CSV files are allowed"), false);
    }
};

const uploadResults = multer({
    storage: resultStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const uploadCSV = multer({
    storage: csvStorage,
    fileFilter: csvFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = {
    uploadResults: uploadResults.fields([
        { name: "test_results", maxCount: 10 },
        { name: "marksheet", maxCount: 10 },
        { name: "answersheet", maxCount: 10 },
    ]),
    uploadCSV: uploadCSV.single("csv"),
};
