const express = require("express");
const router = express.Router();
const asyncHandler = require("../../middlewares/asyncHandler");
const { errorResponse, successResponse } = require("../../helpers/responseHelper");
const { currentDate } = require("../../helpers/helperFunctions");
const authenticateUser = require("../../middlewares/auth");
const authorizeRoles = require("../../middlewares/authRoles");
const branchModels = require("../../models/Branch");
const userModels = require("../../models/Admin");
const { uploadResults } = require("../../middlewares/upload");
const { createRecord, findOneRecord, updateRecord, deleteRecord } = require("../../utils/dbUtils");
const upload = require("../../middlewares/upload");

router.post("/add-result", authenticateUser, authorizeRoles(1, 2), uploadResults, asyncHandler(async (req, res) => {
    const { student_id, test_id } = req.body;

    const student = await findOneRecord(userModels.User, { id: student_id, role: 3 }, 60);
    if (!student) {
        return errorResponse(res, "Student not found! Invalid student id.");
    }

    const test = await findOneRecord(branchModels.StudentTest, { id: test_id }, 60);
    if (!test) {
        return errorResponse(res, "Test not found!");
    }

    const resultData = {
        student_id: student_id,
        test_id: test_id,
        test_results: req.files?.test_results ? JSON.stringify(req.files.test_results.map(f => f.path)) : null,
        marksheet: req.files?.marksheet ? JSON.stringify(req.files.marksheet.map(f => f.path)) : null,
        answersheet: req.files?.answersheet ? JSON.stringify(req.files.answersheet.map(f => f.path)) : null,
        created_at: currentDate(),
    };

    await createRecord(branchModels.StudentResult, resultData, "StudentResult");
    return successResponse(res, "Student result added successfully.", null, true);
})
);

router.put("/edit-result/:pk", authenticateUser, authorizeRoles(1, 2), uploadResults, asyncHandler(async (req, res) => {
    const { pk } = req.params;
    const { student_id, test_id } = req.body;

    const result = await findOneRecord(branchModels.StudentResult, { id: pk }, 60);
    if (!result) {
        return errorResponse(res, "Result not found!");
    }

    const student = await findOneRecord(userModels.User, { id: student_id, role: 3 }, 60);
    if (!student) {
        return errorResponse(res, "Student not found! Invalid student id.");
    }

    const test = await findOneRecord(branchModels.StudentTest, { id: test_id }, 60);
    if (!test) {
        return errorResponse(res, "Test not found!");
    }

    let testResults = result.test_results;
    let marksheet = result.marksheet;
    let answersheet = result.answersheet;

    if (req.files?.test_results) {
        testResults = JSON.stringify(req.files.test_results.map(f => f.path));
    }
    if (req.files?.marksheet) {
        marksheet = JSON.stringify(req.files.marksheet.map(f => f.path));
    }
    if (req.files?.answersheet) {
        answersheet = JSON.stringify(req.files.answersheet.map(f => f.path));
    }

    const updateData = {
        student_id: student_id,
        test_id: test_id,
        test_results: testResults,
        marksheet: marksheet,
        answersheet: answersheet,
    };

    await updateRecord(branchModels.StudentResult, { id: pk }, updateData, "StudentResult");
    return successResponse(res, "Student result updated successfully.", null, true);
}));

router.delete("/delete-result/:pk", authenticateUser, authorizeRoles(1, 2), asyncHandler(async (req, res) => {
    const { pk } = req.params;

    const result = await findOneRecord(branchModels.StudentResult, { id: pk }, 60);
    if (!result) {
        return errorResponse(res, "Result not found!");
    }

    await deleteRecord(branchModels.StudentResult, { id: pk }, "StudentResult");
    return successResponse(res, "Student result deleted successfully.", null, true);
})
);

router.get("/results/download", authenticateUser, authorizeRoles(1, 2), asyncHandler(async (req, res) => {
    const { branch_id, class_id, test_id } = req.query;

    let whereClause = {};
    let testWhere = {};
    if (branch_id) testWhere.branch_id = branch_id;
    if (class_id) testWhere.class_id = class_id;
    if (test_id) whereClause.test_id = test_id;

    const records = await branchModels.StudentResult.findAll({
        where: whereClause,
        include: [
            { model: userModels.User, as: 'student', attributes: ['firstname', 'lastname', 'email'] },
            {
                model: branchModels.StudentTest,
                as: 'test',
                where: testWhere,
                include: [
                    { model: branchModels.Branch, as: 'branch', attributes: ['branch_name'] },
                    { model: branchModels.Class, as: 'class', attributes: ['class_name'] },
                    { model: branchModels.Subject, as: 'subject', attributes: ['subject_name'] }
                ]
            }
        ]
    });

    let csvContent = "Student Name,Email,Branch,Class,Test,Subject,Marks Obtained,Total Marks\n";
    records.forEach(r => {
        csvContent += `${r.student?.firstname} ${r.student?.lastname},${r.student?.email},${r.test?.branch?.branch_name},${r.test?.class?.class_name},${r.test?.test_name || 'N/A'},${r.test?.subject?.subject_name},${r.marks_obtained},${r.total_marks}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=results_report.csv`);
    return res.status(200).send(csvContent);
}));

module.exports = router;
