const express = require("express");
const router = express.Router();
const asyncHandler = require("../../middlewares/asyncHandler");
const { successResponse } = require("../../helpers/responseHelper");
const authenticateUser = require("../../middlewares/auth");
const branchModels = require("../../models/Branch");
const { findAllRecords } = require("../../utils/dbUtils");

router.get("/course-list", authenticateUser, asyncHandler(async (req, res) => {
    const course = await findAllRecords(branchModels.Course, {}, 300);
    return successResponse(res, "Course list fetched successfully!", course, false);
}));

module.exports = router;