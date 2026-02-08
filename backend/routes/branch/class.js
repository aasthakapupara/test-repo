const express = require("express");
const router = express.Router();
const asyncHandler = require("../../middlewares/asyncHandler");
const { successResponse } = require("../../helpers/responseHelper");
const authenticateUser = require("../../middlewares/auth");
const branchModels = require("../../models/Branch");
const { findAllRecords } = require("../../utils/dbUtils");

router.get("/class-list", authenticateUser, asyncHandler(async (req, res) => {
    const classes = await findAllRecords(branchModels.Class, {}, 300);
    return successResponse(res, "Class list fetched successfully!", classes, false);
}));

module.exports = router;