const express = require("express");
const router = express.Router();
const asyncHandler = require("../../middlewares/asyncHandler");
const { successResponse } = require("../../helpers/responseHelper");
const authenticateUser = require("../../middlewares/auth");
const branchModels = require("../../models/Branch");
const { findAllRecords } = require("../../utils/dbUtils");

router.get("/student-subjects-list", authenticateUser, asyncHandler(async (req, res) => {
    const studentSubject = await findAllRecords(branchModels.StudentSubject, {}, 300);
    return successResponse(res, "Student subject list fetched successfully!", studentSubject, false);
}));

module.exports = router;