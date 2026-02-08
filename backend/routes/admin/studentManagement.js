const express = require("express");
const router = express.Router();
const asyncHandler = require("../../middlewares/asyncHandler");
const { errorResponse, successResponse } = require("../../helpers/responseHelper");
const { currentDate } = require("../../helpers/helperFunctions");
const authenticateUser = require("../../middlewares/auth");
const authorizeRoles = require("../../middlewares/authRoles");
const branchModels = require("../../models/Branch");
const userModels = require("../../models/Admin");
const { createRecord, findOneRecord, updateRecord, deleteRecord } = require("../../utils/dbUtils");
const bcrypt = require("bcrypt");

router.post("/add-student", authenticateUser, authorizeRoles(1, 2), asyncHandler(async (req, res) => {
    const { firstname, lastname, email, mobile, password, branch_id, class_id, course_id, address, parent_contact } = req.body;

    if (!mobile || !password) {
        return errorResponse(res, "Mobile and Password are required!");
    }

    const existingUser = await findOneRecord(userModels.User, { mobile: mobile }, 60);
    if (existingUser) {
        return errorResponse(res, "User with this mobile number already exists!");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
        firstname,
        lastname,
        email,
        mobile,
        password: hashedPassword,
        role: 3, // Student
        created_at: currentDate()
    };

    const newUser = await createRecord(userModels.User, userData, "User");

    const managementData = {
        student_id: newUser.id,
        branch_id: branch_id,
        class_id: class_id,
        course_id: course_id,
        // Assuming some fields like address might go to another table if needed, 
        // but for now creating the assignment
    };

    await createRecord(branchModels.StudentManagement, managementData, "StudentManagement");
    return successResponse(res, "Student created and assigned successfully.", { student_id: newUser.id }, true);
}));

router.post("/add-student-management", authenticateUser, authorizeRoles(1, 2), asyncHandler(async (req, res) => {
    const { student_id, branch_id, class_id, course_id } = req.body;

    const student = await findOneRecord(userModels.User, { id: student_id, role: 3 }, 60);
    if (!student) {
        return errorResponse(res, "Student not found!");
    }

    const branch = await findOneRecord(branchModels.Branch, { id: branch_id }, 60);
    if (!branch) {
        return errorResponse(res, "Branch not found!");
    }

    const classes = await findOneRecord(branchModels.Class, { id: class_id }, 60);
    if (!classes) {
        return errorResponse(res, "Class not found!");
    }

    const course = await findOneRecord(branchModels.Course, { id: course_id }, 60);
    if (!course) {
        return errorResponse(res, "Course not found!");
    }

    const mData = {
        student_id: student_id,
        branch_id: branch_id,
        class_id: class_id,
        course_id: course_id,
    };

    await createRecord(branchModels.StudentManagement, mData, "StudentManagement");
    return successResponse(res, "Student management data added successfully.", null, true);
}));

router.put("/edit-student-management/:pk", authenticateUser, authorizeRoles(1, 2), asyncHandler(async (req, res) => {
    const { pk } = req.params;
    const { student_id, branch_id, class_id, course_id, status, firstname, lastname, email, mobile, password } = req.body;
    console.log(`Editing student management ${pk} with body:`, req.body);

    const management = await findOneRecord(branchModels.StudentManagement, { id: pk }, 60);
    if (!management) {
        return errorResponse(res, "Student management record not found!");
    }

    /* ---- UPDATE USER TABLE IF DETAILS PROVIDED ---- */
    const targetUserId = student_id || management.student_id;
    const user = await findOneRecord(userModels.User, { id: targetUserId }, 60);
    if (user) {
        const userUpdateData = {
            firstname: firstname || user.firstname,
            lastname: lastname || user.lastname,
            email: email || user.email,
            mobile: mobile || user.mobile,
            updated_at: currentDate()
        };

        if (password) {
            userUpdateData.password = await bcrypt.hash(password, 10);
        }

        await updateRecord(userModels.User, { id: targetUserId }, userUpdateData, "User");
    }

    const updateData = {
        student_id: targetUserId,
        branch_id: branch_id || management.branch_id,
        class_id: class_id || management.class_id,
        course_id: course_id || management.course_id,
        status: status !== undefined ? status : management.status
    };

    try {
        await updateRecord(branchModels.StudentManagement, { id: pk }, updateData, "StudentManagement");
        return successResponse(res, "Student management data updated successfully.", null, true);
    } catch (err) {
        console.error("Error updating student management:", err);
        return errorResponse(res, "Failed to update student data.");
    }
}));


router.delete("/delete-student-management/:pk", authenticateUser, authorizeRoles(1, 2), asyncHandler(async (req, res) => {
    const { pk } = req.params;

    const management = await findOneRecord(branchModels.StudentManagement, { id: pk }, 60);
    if (!management) {
        return errorResponse(res, "Student management data not found!");
    }

    await deleteRecord(branchModels.StudentManagement, { id: pk }, "StudentManagement");
    return successResponse(res, "Student management record deleted successfully!", null, true);
}));

module.exports = router;