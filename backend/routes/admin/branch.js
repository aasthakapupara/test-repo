const express = require("express");
const router = express.Router();
const asyncHandler = require("../../middlewares/asyncHandler");
const { errorResponse, successResponse } = require("../../helpers/responseHelper");
const authenticateUser = require("../../middlewares/auth");
const authorizeRoles = require("../../middlewares/authRoles");
const branchModels = require("../../models/Branch");
const { createRecord, findOneRecord, updateRecord, deleteRecord } = require("../../utils/dbUtils");

router.post("/add-branch", authenticateUser, authorizeRoles(1), asyncHandler(async (req, res) => {
    const { branch_name, branch_address, branch_email, branch_contact_number } = req.body;

    const existingBranch = await findOneRecord(branchModels.Branch, { branch_name: branch_name }, 60);
    if (existingBranch) {
        return errorResponse(res, "Branch with this name already exists!");
    }

    const branchData = {
        branch_name: branch_name,
        branch_address: branch_address,
        branch_email: branch_email,
        branch_contact_number: branch_contact_number,
    };

    await createRecord(branchModels.Branch, branchData, "Branch");
    return successResponse(res, "Branch added successfully.", null, true);
}));

router.put("/edit-branch/:pk", authenticateUser, authorizeRoles(1), asyncHandler(async (req, res) => {
    const { pk } = req.params;
    const { branch_name, branch_address, branch_email, branch_contact_number } = req.body;

    const branch = await findOneRecord(branchModels.Branch, { id: pk }, 60);
    if (!branch) {
        return errorResponse(res, "Branch not found!");
    }

    const existingBranch = await findOneRecord(branchModels.Branch, { branch_name: branch_name }, 60);
    if (existingBranch && existingBranch.id !== parseInt(pk)) {
        return errorResponse(res, "Another branch with this name already exists!");
    }

    const updateData = {
        branch_name: branch_name,
        branch_address: branch_address,
        branch_email: branch_email,
        branch_contact_number: branch_contact_number,
    };

    await updateRecord(branchModels.Branch, { id: pk }, updateData, "Branch");
    return successResponse(res, "Branch updated successfully.", null, true);
}));

router.get("/dashboard/stats", authenticateUser, authorizeRoles(1), asyncHandler(async (req, res) => {
    // Mock stats for now
    const stats = {
        totalBranches: 5,
        totalStudents: 150,
        totalFaculty: 20,
        totalRevenue: "45,000"
    };
    return successResponse(res, "Dashboard stats fetched successfully.", stats, false);
}));

router.get("/branch-details/:pk", authenticateUser, authorizeRoles(1), asyncHandler(async (req, res) => {
    const { pk } = req.params;

    const branch = await findOneRecord(branchModels.Branch, { id: pk }, 60);
    if (!branch) {
        return errorResponse(res, "Branch not found!");
    }

    // 1. Get Student Count
    const studentCount = await branchModels.StudentManagement.count({
        where: { branch_id: pk }
    });

    // 2. Get Attendance Summary (Today)
    const today = new Date().toISOString().split('T')[0];
    const attendanceSummary = await require("../../models/Attendance/attendance").findAll({
        where: {
            branch_id: pk,
            date: today
        },
        attributes: [
            [require("sequelize").fn("COUNT", require("sequelize").col("id")), "total"],
            "status"
        ],
        group: ["status"]
    });

    // 3. Get Recent Results Summary
    const resultsCount = await branchModels.StudentResult.count({
        include: [{
            model: branchModels.StudentTest,
            as: 'test',
            where: { branch_id: pk }
        }]
    });

    const details = {
        branch,
        stats: {
            totalStudents: studentCount,
            todayAttendance: attendanceSummary,
            totalResults: resultsCount
        }
    };

    return successResponse(res, "Branch details fetched successfully.", details, false);
}));

router.delete("/delete-branch/:pk", authenticateUser, authorizeRoles(1), asyncHandler(async (req, res) => {
    const { pk } = req.params;

    const branch = await findOneRecord(branchModels.Branch, { id: pk }, 60);
    if (!branch) {
        return errorResponse(res, "Branch not found!");
    }

    await deleteRecord(branchModels.Branch, { id: pk }, "Branch");
    return successResponse(res, "Branch deleted successfully!", null, true);
}));

module.exports = router;