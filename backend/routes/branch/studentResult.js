const express = require("express");
const router = express.Router();
const asyncHandler = require("../../middlewares/asyncHandler");
const { successResponse } = require("../../helpers/responseHelper");
const authenticateUser = require("../../middlewares/auth");
const branchModels = require("../../models/Branch");
const { findAllRecords } = require("../../utils/dbUtils");

router.get("/student-result-list", authenticateUser, asyncHandler(async (req, res) => {
    const studentresults = await branchModels.StudentResult.findAll({
        include: [
            { model: require("../../models/Admin/user"), as: 'student', attributes: ['firstname', 'lastname'] },
            {
                model: branchModels.StudentTest,
                as: 'test',
                include: [
                    { model: branchModels.Subject, as: 'subject', attributes: ['subject_name'] }
                ]
            }
        ]
    });

    const result = studentresults.map(sr => {
        const data = sr.toJSON();
        return {
            ...data,
            student_name: `${data.student?.firstname} ${data.student?.lastname}`,
            subject_name: data.test?.subject?.subject_name,
            subject: data.test?.subject,
            test_name: data.test?.test_name
        };
    });

    return successResponse(res, "Student result list fetched successfully!", result, false);
}));

module.exports = router;