const sendResponse = (res, status, response, message, pagination, content = null, is_paginated = 0) => {
    if (is_paginated === 1) {
        return res.status(status).json({ response, message, pagination, content });
    }
    return res.status(status).json({ response, message, content });
};

const successResponse = (res, msg, content = null, created = false, pagination = null, is_paginated = 0) => {
    const status = created ? 201 : 200; // 201 for create, 200 otherwise
    return sendResponse(res, status, "success", msg, pagination, content, is_paginated);
};

const errorResponse = (res, msg, status = 400) => {
    return sendResponse(res, status, "error", msg);
};

const errorResponseToken = (res, msg, status = 400) => {
    return sendResponse(res, status, "tokenerror", msg);
};

module.exports = { successResponse, errorResponse, errorResponseToken };