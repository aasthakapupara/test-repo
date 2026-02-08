const express = require("express");
const router = express.Router();
const asyncHandler = require("../../middlewares/asyncHandler");
const { successResponse } = require("../../helpers/responseHelper");
const authenticateUser = require("../../middlewares/auth");
const branchModels = require("../../models/Branch");
const { findAllRecords } = require("../../utils/dbUtils");

router.get("/faculty-subjects-list", authenticateUser, asyncHandler(async (req, res) => {
    const facultySubject = await findAllRecords(branchModels.FacultySubject, {}, 300);
    return successResponse(res, "Faculty subject list fetched successfully!", facultySubject, false);
}));

module.exports = router;