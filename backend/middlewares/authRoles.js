const { errorResponse } = require("../helpers/responseHelper");

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {

        if (!req.user || !req.user.role) {
            return errorResponse(res, "User role not found!", 401);
        }

        // If user.role not inside allowedRoles array → reject
        if (!allowedRoles.includes(req.user.role)) {
            return errorResponse(res, "You are not authorized to access this resource!", 403);
        }

        next();
    };
};

module.exports = authorizeRoles;