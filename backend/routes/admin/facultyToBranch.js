const express = require("express");
const router = express.Router();
const asyncHandler = require("../../middlewares/asyncHandler");
const { errorResponse, successResponse } = require("../../helpers/responseHelper");
const { currentDate } = require("../../helpers/helperFunctions");
const authenticateUser = require("../../middlewares/auth");
const authorizeRoles = require("../../middlewares/authRoles");
const branchModels = require("../../models/Branch");
const userModels = require("../../models/Admin");
const bcrypt = require("bcrypt");
const { createRecord, findOneRecord, updateRecord, deleteRecord } = require("../../utils/dbUtils");

router.post("/add-faculty", authenticateUser, authorizeRoles(1), asyncHandler(async (req, res) => {
    const { branch_id, faculty_id, firstname, lastname, email, mobile, password, address } = req.body;

    let targetFacultyId = faculty_id;

    // If no faculty_id, create a new user
    if (!targetFacultyId) {
        if (!mobile || !password) {
            return errorResponse(res, "Mobile and Password are required for new faculty!");
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
            role: 2, // Faculty
            created_at: currentDate()
        };

        const newUser = await createRecord(userModels.User, userData, "User");
        targetFacultyId = newUser.id;
    }

    const branch = await findOneRecord(branchModels.Branch, { id: branch_id }, 60);
    if (!branch) {
        return errorResponse(res, "Branch not found! Invalid branch id.");
    }

    const faculty = await findOneRecord(userModels.User, { id: targetFacultyId, role: 2 }, 60);
    if (!faculty) {
        return errorResponse(res, "Faculty not found! Invalid faculty id.");
    }

    const facultyData = {
        branch_id: branch_id,
        faculty_id: targetFacultyId,
        created_at: currentDate(),
    };

    await createRecord(branchModels.FacultyToBranch, facultyData, "FacultyToBranch");
    return successResponse(res, "Faculty created and assigned successfully.", { faculty_id: targetFacultyId }, true);
}));

router.put("/edit-faculty/:pk", authenticateUser, authorizeRoles(1), asyncHandler(async (req, res) => {
    const { pk } = req.params;
    const { branch_id, faculty_id, status, firstname, lastname, email, mobile, password, address } = req.body;
    console.log(`[DEBUG] Attempting to edit Faculty mapping ID: ${pk}`);
    console.log(`[DEBUG] Request Body:`, JSON.stringify(req.body));

    const mapping = await findOneRecord(branchModels.FacultyToBranch, { faculty_to_branch_id: pk }, 60);
    if (!mapping) {
        console.log(`Faculty mapping ${pk} not found.`);
        return errorResponse(res, "Faculty assignment not found!");
    }

    /* ---- UPDATE USER TABLE IF DETAILS PROVIDED ---- */
    const targetUserId = faculty_id || mapping.faculty_id;
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
        branch_id: branch_id || mapping.branch_id,
        faculty_id: targetUserId,
        status: status !== undefined ? status : mapping.status,
        updated_at: currentDate()
    };

    try {
        await updateRecord(branchModels.FacultyToBranch, { faculty_to_branch_id: pk }, updateData, "FacultyToBranch");
        return successResponse(res, "Faculty assignment updated successfully.", null, true);
    } catch (err) {
        console.error("Error updating faculty assignment:", err);
        return errorResponse(res, "Failed to update faculty assignment.");
    }
}));


router.delete("/delete-faculty/:pk", authenticateUser, authorizeRoles(1), asyncHandler(async (req, res) => {
    const { pk } = req.params;
    console.log(`[DEBUG] Attempting to delete Faculty mapping ID: ${pk}`);

    const facultytobranch = await findOneRecord(branchModels.FacultyToBranch, { faculty_to_branch_id: pk }, 60);
    if (!facultytobranch) {
        return errorResponse(res, "Faculty to branch id not found!");
    }

    await deleteRecord(branchModels.FacultyToBranch, { faculty_to_branch_id: pk }, "FacultyToBranch");
    return successResponse(res, "Faculty to branch record deleted successfully!", null, true);
}));

module.exports = router;