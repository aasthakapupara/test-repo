const express = require("express");
const router = express.Router();
const asyncHandler = require("../../middlewares/asyncHandler");
const { successResponse } = require("../../helpers/responseHelper");
const authenticateUser = require("../../middlewares/auth");
const branchModels = require("../../models/Branch");
const { findAllRecords } = require("../../utils/dbUtils");

router.get("/branch-list", authenticateUser, asyncHandler(async (req, res) => {
    const branch = await findAllRecords(branchModels.Branch, {}, 300);
    return successResponse(res, "Branch list fetched successfully!", branch, false);
}));

module.exports = router;