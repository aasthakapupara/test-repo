const express = require("express");
const router = express.Router();
const asyncHandler = require("../../middlewares/asyncHandler");
const { errorResponse, successResponse } = require("../../helpers/responseHelper");
const { currentDate } = require("../../helpers/helperFunctions");
const authenticateUser = require("../../middlewares/auth");
const authorizeRoles = require("../../middlewares/authRoles");
const branchModels = require("../../models/Branch");
const { createRecord, findOneRecord, updateRecord, deleteRecord } = require("../../utils/dbUtils");

router.post("/add-subject", authenticateUser, authorizeRoles(1), asyncHandler(async (req, res) => {
    const { subject_name, subject_slug } = req.body;

    const existingSubject = await findOneRecord(branchModels.Subject, { subject_name: subject_name }, 60);
    if (existingSubject) {
        return errorResponse(res, "Subject with this name already exists!");
    }

    const subjectData = {
        subject_name: subject_name,
        subject_slug: subject_slug,
        created_at: currentDate()
    };

    try {
        await createRecord(branchModels.Subject, subjectData, "Subject");
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return errorResponse(res, "Subject slug already exists!");
        }
        throw err;
    }
    return successResponse(res, "Subject added successfully.", null, true);
}));

router.put("/edit-subject/:pk", authenticateUser, authorizeRoles(1), asyncHandler(async (req, res) => {
    const { pk } = req.params;
    const { subject_name, subject_slug, status } = req.body;

    const subjectRecord = await findOneRecord(branchModels.Subject, { id: pk }, 60);
    if (!subjectRecord) {
        return errorResponse(res, "Subject not found!");
    }

    if (subject_name) {
        const existingSubject = await findOneRecord(branchModels.Subject, { subject_name: subject_name }, 60);
        if (existingSubject && existingSubject.id !== parseInt(pk)) {
            return errorResponse(res, "Another subject with this name already exists!");
        }
    }

    const updateData = {
        subject_name: subject_name || subjectRecord.subject_name,
        subject_slug: subject_slug || subjectRecord.subject_slug,
        status: status || subjectRecord.status,
    };

    await updateRecord(branchModels.Subject, { id: pk }, updateData, "Subject");
    return successResponse(res, "Subject data updated successfully.", null, true);
}));


router.delete("/delete-subject/:pk", authenticateUser, authorizeRoles(1), asyncHandler(async (req, res) => {
    const { pk } = req.params;

    const subject = await findOneRecord(branchModels.Subject, { id: pk }, 60);
    if (!subject) {
        return errorResponse(res, "Subject not found!");
    }

    await deleteRecord(branchModels.Subject, { id: pk }, "Subject");
    return successResponse(res, "Subject deleted successfully!", null, true);
}));

module.exports = router;