const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const asyncHandler = require("../../middlewares/asyncHandler");
const { errorResponse, successResponse } = require("../../helpers/responseHelper");
const userModels = require("../../models/Admin");
const { findOneRecord } = require("../../utils/dbUtils");

router.post("/login", asyncHandler(async (req, res) => {
    const { mobile, password } = req.body;

    const userData = await findOneRecord(userModels.User, { mobile: mobile });
    if (!userData) {
        return errorResponse(res, "User not found!");
    }

    const isPasswordMatch = await bcrypt.compare(password, userData.password);
    if (!isPasswordMatch) {
        return errorResponse(res, "Invalid password!");
    }
    const accessToken = jwt.sign(
        {
            id: userData.id, role: userData.role, firstname: userData.firstname, lastname: userData.lastname, mobile: userData.mobile, email: userData.email
        },
        process.env.TOKEN_KEY,
        { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
        {
            id: userData.id, role: userData.role, firstname: userData.firstname, lastname: userData.lastname, mobile: userData.mobile, email: userData.email
        },
        process.env.REFRESH_KEY,
        { expiresIn: "7d" }
    );

    return successResponse(res, "Login successfully!", { accessToken, refreshToken }, true);
}));

router.post("/refresh-token", asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return errorResponse(res, "Refresh token required!");
    }
    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_KEY);
        const userData = await findOneRecord(userModels.User, { id: decoded.id });

        if (!userData) {
            return errorResponse(res, "User not found!");
        }
        const newAccessToken = jwt.sign(
            {
                id: userData.id, role: userData.role, firstname: userData.firstname, lastname: userData.lastname, mobile: userData.mobile, email: userData.email
            },
            process.env.TOKEN_KEY,
            { expiresIn: "15m" }
        );
        return successResponse(res, "Access token refreshed!", { accessToken: newAccessToken }, true);
    } catch (err) {
        return errorResponse(res, "Invalid or expired refresh token!", 401);
    }
}));

module.exports = router;