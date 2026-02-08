const express = require("express");
const router = express.Router();
const asyncHandler = require("../../middlewares/asyncHandler");
const { successResponse } = require("../../helpers/responseHelper");
const authenticateUser = require("../../middlewares/auth");
const branchModels = require("../../models/Branch");
const { findAllRecords } = require("../../utils/dbUtils");

router.get("/student-test-list", authenticateUser, asyncHandler(async (req, res) => {
    const studentTest = await findAllRecords(branchModels.StudentTest, {}, 300);
    return successResponse(res, "Student test list fetched successfully!", studentTest, false);
}));

module.exports = router;