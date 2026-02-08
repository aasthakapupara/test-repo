const express = require("express");
const router = express.Router();
const asyncHandler = require("../../middlewares/asyncHandler");
const { errorResponse, successResponse } = require("../../helpers/responseHelper");
const { currentDate } = require("../../helpers/helperFunctions");
const authenticateUser = require("../../middlewares/auth");
const authorizeRoles = require("../../middlewares/authRoles");
const branchModels = require("../../models/Branch");
const { createRecord, findOneRecord, updateRecord, deleteRecord } = require("../../utils/dbUtils");

router.post("/add-course", authenticateUser, authorizeRoles(1), asyncHandler(async (req, res) => {
    const { course_name, course_slug } = req.body;

    const existingCourse = await findOneRecord(branchModels.Course, { course_name: course_name }, 60);
    if (existingCourse) {
        return errorResponse(res, "Course with this name already exists!");
    }

    const courseData = {
        course_name: course_name,
        course_slug: course_slug,
        created_at: currentDate()
    };

    try {
        await createRecord(branchModels.Course, courseData, "Course");
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return errorResponse(res, "Course slug already exists!");
        }
        throw err;
    }
    return successResponse(res, "Course added successfully.", null, true);
}));

router.put("/edit-course/:pk", authenticateUser, authorizeRoles(1), asyncHandler(async (req, res) => {
    const { pk } = req.params;
    const { course_name, course_slug, status } = req.body;

    const courseRecord = await findOneRecord(branchModels.Course, { id: pk }, 60);
    if (!courseRecord) {
        return errorResponse(res, "Course not found!");
    }

    if (course_name) {
        const existingCourse = await findOneRecord(branchModels.Course, { course_name: course_name }, 60);
        if (existingCourse && existingCourse.id !== parseInt(pk)) {
            return errorResponse(res, "Another course with this name already exists!");
        }
    }

    const updateData = {
        course_name: course_name || courseRecord.course_name,
        course_slug: course_slug || courseRecord.course_slug,
        status: status || courseRecord.status,
    };

    await updateRecord(branchModels.Course, { id: pk }, updateData, "Course");
    return successResponse(res, "Course data updated successfully.", null, true);
}));


router.delete("/delete-course/:pk", authenticateUser, authorizeRoles(1), asyncHandler(async (req, res) => {
    const { pk } = req.params;

    const course = await findOneRecord(branchModels.Course, { id: pk }, 60);
    if (!course) {
        return errorResponse(res, "Course not found!");
    }

    await deleteRecord(branchModels.Course, { id: pk }, "Course");
    return successResponse(res, "Course deleted successfully!", null, true);
}));

module.exports = router;