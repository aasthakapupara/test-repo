const express = require("express");
const router = express.Router();
const asyncHandler = require("../../middlewares/asyncHandler");
const { successResponse } = require("../../helpers/responseHelper");
const authenticateUser = require("../../middlewares/auth");
const branchModels = require("../../models/Branch");
const { findAllRecords } = require("../../utils/dbUtils");

router.get("/faculty-list", authenticateUser, asyncHandler(async (req, res) => {
    try {
        const facultyToBranch = await branchModels.FacultyToBranch.findAll({
            include: [
                { model: branchModels.Branch, as: 'branch' },
                {
                    model: require("../../models/Admin/user"),
                    as: 'faculty',
                    attributes: { exclude: ['password'] }
                }
            ]
        });

        // Map to flatten the structure for easier frontend consumption
        const result = facultyToBranch.map(ftb => {
            const data = ftb.toJSON();
            return {
                id: data.faculty_to_branch_id, // Normalize PK to 'id'
                ...data.faculty,
                branch: data.branch,
                branch_id: data.branch_id,
                faculty_id: data.faculty_id,
                status: data.status,
                address: data.faculty?.address,
                faculty_to_branch_id: data.faculty_to_branch_id
            };
        });

        return successResponse(res, "Faculty to branch list fetched successfully!", result, false);
    } catch (err) {
        console.error("Error fetching faculty list:", err);
        return errorResponse(res, "Failed to fetch faculty list.");
    }
}));

module.exports = router;