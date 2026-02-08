const express = require("express");
const router = express.Router();
const asyncHandler = require("../../middlewares/asyncHandler");
const { errorResponse, successResponse } = require("../../helpers/responseHelper");
const authenticateUser = require("../../middlewares/auth");
const authorizeRoles = require("../../middlewares/authRoles");
const branchModels = require("../../models/Branch");
const { createRecord, findOneRecord, updateRecord, deleteRecord } = require("../../utils/dbUtils");

router.post("/add-faculty-subject", authenticateUser, authorizeRoles(1), asyncHandler(async (req, res) => {
    const { faculty_to_branch_id, subject_id } = req.body;

    const facultytobranch = await findOneRecord(branchModels.FacultyToBranch, { faculty_to_branch_id: faculty_to_branch_id }, 60);
    if (!facultytobranch) {
        return errorResponse(res, "Faculty to branch not found! Invalid faculty to branch id.");
    }

    const subject = await findOneRecord(branchModels.Subject, { id: subject_id }, 60);
    if (!subject) {
        return errorResponse(res, "Subject not found! Invalid subject id.");
    }

    const facultySubjectData = {
        faculty_to_branch_id: faculty_to_branch_id,
        subject_id: subject_id,
    };

    await createRecord(branchModels.FacultySubject, facultySubjectData, "FacultySubject");
    return successResponse(res, "Faculty subject assigned successfully.", null, true);
}));

router.put("/edit-faculty-subject/:pk", authenticateUser, authorizeRoles(1), asyncHandler(async (req, res) => {
    const { pk } = req.params;
    const { faculty_to_branch_id, subject_id } = req.body;

    const facultySubject = await findOneRecord(branchModels.FacultySubject, { id: pk }, 60);
    if (!facultySubject) {
        return errorResponse(res, "Faculty subject id not found!");
    }

    const facultytobranch = await findOneRecord(branchModels.FacultyToBranch, { faculty_to_branch_id: faculty_to_branch_id }, 60);
    if (!facultytobranch) {
        return errorResponse(res, "Faculty to branch not found! Invalid faculty to branch id.");
    }

    const subject = await findOneRecord(branchModels.Subject, { id: subject_id }, 60);
    if (!subject) {
        return errorResponse(res, "Subject not found! Invalid subject id.");
    }

    const updateData = {
        faculty_to_branch_id: faculty_to_branch_id,
        subject_id: subject_id,
    };

    await updateRecord(branchModels.FacultySubject, { id: pk }, updateData, "FacultySubject");
    return successResponse(res, "Faculty subject data updated successfully.", null, true);
}));


router.delete("/delete-faculty-subject/:pk", authenticateUser, authorizeRoles(1), asyncHandler(async (req, res) => {
    const { pk } = req.params;

    const facultySubject = await findOneRecord(branchModels.FacultySubject, { id: pk }, 60);
    if (!facultySubject) {
        return errorResponse(res, "Faculty subject id not found!");
    }

    await deleteRecord(branchModels.FacultySubject, { id: pk }, "FacultySubject");
    return successResponse(res, "Faculty subject record deleted successfully!", null, true);
}));

module.exports = router;