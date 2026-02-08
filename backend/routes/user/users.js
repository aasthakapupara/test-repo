const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const asyncHandler = require("../../middlewares/asyncHandler");
const { errorResponse, successResponse } = require("../../helpers/responseHelper");
const { currentDate } = require("../../helpers/helperFunctions");
const authenticateUser = require("../../middlewares/auth");
const authorizeRoles = require("../../middlewares/authRoles");
const userModels = require("../../models/Admin");
const { createRecord, findOneRecord, updateRecord, deleteRecord } = require("../../utils/dbUtils");

router.post("/add-user", asyncHandler(async (req, res) => {
    const { firstname, lastname, email, mobile, password } = req.body;

    const existingUser = await findOneRecord(userModels.User, { mobile: mobile }, 60);
    if (existingUser) {
        return errorResponse(res, "User with this mobile number already exists!");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
        firstname: firstname,
        lastname: lastname,
        email: email,
        mobile: mobile,
        password: hashedPassword,
        created_at: currentDate(),
        role: 3
    };

    await createRecord(userModels.User, userData, "User");
    return successResponse(res, "User added successfully.", null, true);
}));

router.put("/edit-user/:pk", authenticateUser, authorizeRoles(1, 2, 3), asyncHandler(async (req, res) => {
    const { pk } = req.params;
    const loggedInUserId = req.user.id;
    const loggedInUserRole = req.user.role;

    if (loggedInUserRole !== 1 && loggedInUserId !== parseInt(pk)) {
        return errorResponse(res, "Invalid user id!");
    }

    const { firstname, lastname, email, mobile, role } = req.body;

    const user = await findOneRecord(userModels.User, { id: pk }, 60);
    if (!user) {
        return errorResponse(res, "User not found!");
    }

    const existingUser = await findOneRecord(userModels.User, { mobile: mobile }, 60);
    if (existingUser && existingUser.id !== parseInt(pk)) {
        return errorResponse(res, "Another user with this mobile number already exists!");
    }

    const updateData = {
        firstname: firstname,
        lastname: lastname,
        email: email,
        mobile: mobile,
        role: role
    };

    if (loggedInUserRole !== 1) {
        delete updateData.role;
    }

    await updateRecord(userModels.User, { id: pk }, updateData, "User");
    return successResponse(res, "User data updated successfully.", null, true);
}));

router.delete("/delete-user/:pk", authenticateUser, authorizeRoles(1), asyncHandler(async (req, res) => {
    const { pk } = req.params;

    const user = await findOneRecord(userModels.User, { id: pk }, 60);
    if (!user) {
        return errorResponse(res, "User not found!");
    }

    await deleteRecord(userModels.User, { id: pk }, "User");
    return successResponse(res, "User deleted successfully!", null, true);
}));

module.exports = router;