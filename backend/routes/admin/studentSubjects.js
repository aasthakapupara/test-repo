const express = require("express");
const router = express.Router();
const asyncHandler = require("../../middlewares/asyncHandler");
const { errorResponse, successResponse } = require("../../helpers/responseHelper");
const authenticateUser = require("../../middlewares/auth");
const authorizeRoles = require("../../middlewares/authRoles");
const branchModels = require("../../models/Branch");
const { createRecord, findOneRecord, updateRecord, deleteRecord } = require("../../utils/dbUtils");

router.post("/add-student-subject", authenticateUser, authorizeRoles(1, 2), asyncHandler(async (req, res) => {
    const { student_management_id, subject_id } = req.body;

    const management = await findOneRecord(branchModels.StudentManagement, { id: student_management_id }, 60);
    if (!management) {
        return errorResponse(res, "Student management id not found! Invalid student management id.");
    }

    const subject = await findOneRecord(branchModels.Subject, { id: subject_id }, 60);
    if (!subject) {
        return errorResponse(res, "Subject not found! Invalid subject id.");
    }

    const studentSubjectData = {
        student_management_id: student_management_id,
        subject_id: subject_id,
    };

    await createRecord(branchModels.StudentSubject, studentSubjectData, "StudentSubject");
    return successResponse(res, "Student subject assigned successfully.", null, true);
}));

router.put("/edit-student-subject/:pk", authenticateUser, authorizeRoles(1), asyncHandler(async (req, res) => {
    const { pk } = req.params;
    const { student_management_id, subject_id } = req.body;

    const studentSubject = await findOneRecord(branchModels.StudentSubject, { id: pk }, 60);
    if (!studentSubject) {
        return errorResponse(res, "Student subject id not found!");
    }

    const management = await findOneRecord(branchModels.StudentManagement, { id: student_management_id }, 60);
    if (!management) {
        return errorResponse(res, "Student management id not found! Invalid student management id.");
    }

    const subject = await findOneRecord(branchModels.Subject, { id: subject_id }, 60);
    if (!subject) {
        return errorResponse(res, "Subject not found! Invalid subject id.");
    }

    const updateData = {
        student_management_id: student_management_id,
        subject_id: subject_id,
    };

    await updateRecord(branchModels.StudentSubject, { id: pk }, updateData, "StudentSubject");
    return successResponse(res, "Student subject data updated successfully.", null, true);
}));


router.delete("/delete-student-subject/:pk", authenticateUser, authorizeRoles(1), asyncHandler(async (req, res) => {
    const { pk } = req.params;

    const studentSubject = await findOneRecord(branchModels.StudentSubject, { id: pk }, 60);
    if (!studentSubject) {
        return errorResponse(res, "Student subject id not found!");
    }

    await deleteRecord(branchModels.StudentSubject, { id: pk }, "StudentSubject");
    return successResponse(res, "Student subject record deleted successfully!", null, true);
}));

module.exports = router;