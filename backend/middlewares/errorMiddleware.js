const errorMiddleware = (err, req, res, next) => {
    return res.status(500).json({
        response: "error",
        message: "Error while saving data!",
        content: null,
        devMessage: process.env.NODE_ENV === "development" || "test" ? err.stack : null,
    });
};

module.exports = errorMiddleware;