const jwt = require("jsonwebtoken");
const { errorResponse } = require("../helpers/responseHelper");
const { findOneRecord } = require("../utils/dbUtils");
const userModels = require("./../models/Admin");

const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return errorResponse(res, "Access token required!", 401, false);
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);

        // Fetch full employee
        const user = await findOneRecord(userModels.User, { id: decoded.id });

        if (!user) {
            return errorResponse(res, "User not found or inactive!", 404, false);
        }

        req.user = user;
        next();
    } catch (err) {
        return errorResponse(res, "Invalid or expired token!", 401, false);
    }
};

module.exports = authenticateUser;