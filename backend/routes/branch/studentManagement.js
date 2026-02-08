const express = require("express");
const router = express.Router();
const asyncHandler = require("../../middlewares/asyncHandler");
const { successResponse, errorResponse } = require("../../helpers/responseHelper");
const authenticateUser = require("../../middlewares/auth");
const branchModels = require("../../models/Branch");
const { findAllRecords } = require("../../utils/dbUtils");

router.get("/student-management-list", authenticateUser, asyncHandler(async (req, res) => {
    try {
        const studentManagement = await branchModels.StudentManagement.findAll({
            include: [
                { model: branchModels.Branch, as: 'branch' },
                { model: branchModels.Class, as: 'class' },
                { model: branchModels.Course, as: 'course' },
                {
                    model: require("../../models/Admin/user"),
                    as: 'student',
                    attributes: { exclude: ['password'] }
                }
            ]
        });

        const result = studentManagement.map(sm => {
            const data = sm.toJSON();
            return {
                id: data.id,
                ...data.student,
                branch: data.branch,
                class: data.class,
                course: data.course,
                status: data.status,
                address: data.student?.address,
                parent_contact: data.student?.parent_contact,
                branch_id: data.branch_id,
                student_id: data.student_id,
                class_id: data.class_id,
                course_id: data.course_id
            };
        });

        return successResponse(res, "Student management list fetched successfully!", result, false);
    } catch (err) {
        console.error("Error fetching student list:", err);
        return errorResponse(res, "Failed to fetch student list.");
    }
}));

module.exports = router;