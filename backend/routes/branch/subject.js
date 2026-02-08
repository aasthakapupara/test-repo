const express = require("express");
const router = express.Router();
const asyncHandler = require("../../middlewares/asyncHandler");
const { successResponse } = require("../../helpers/responseHelper");
const authenticateUser = require("../../middlewares/auth");
const branchModels = require("../../models/Branch");
const { findAllRecords } = require("../../utils/dbUtils");

router.get("/subject-list", authenticateUser, asyncHandler(async (req, res) => {
    const subject = await findAllRecords(branchModels.Subject, {}, 300);
    return successResponse(res, "Subject list fetched successfully!", subject, false);
}));

module.exports = router;