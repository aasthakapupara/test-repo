const express = require("express");
const router = express.Router();
const asyncHandler = require("../../middlewares/asyncHandler");
const { errorResponse, successResponse } = require("../../helpers/responseHelper");
const { currentDate } = require("../../helpers/helperFunctions");
const authenticateUser = require("../../middlewares/auth");
const authorizeRoles = require("../../middlewares/authRoles");
const branchModels = require("../../models/Branch");
const { createRecord, findOneRecord, updateRecord, deleteRecord } = require("../../utils/dbUtils");

router.post("/add-test", authenticateUser, authorizeRoles(1, 2), asyncHandler(async (req, res) => {
    const { test_name, class_id } = req.body;

    const existingBranch = await findOneRecord(branchModels.StudentTest, { test_name: test_name }, 60);
    if (existingBranch) {
        return errorResponse(res, "Test with this name already exists!");
    }

    const classes = await findOneRecord(branchModels.Class, { id: class_id }, 60);
    if (!classes) {
        return errorResponse(res, "Class not found!");
    }

    const classData = {
        test_name: test_name,
        class_id: class_id,
        created_at: currentDate(),
    };

    await createRecord(branchModels.StudentTest, classData, "StudentTest");
    return successResponse(res, "Test added successfully.", null, true);
}));

router.put("/edit-test/:pk", authenticateUser, authorizeRoles(1, 2), asyncHandler(async (req, res) => {
    const { pk } = req.params;
    const { test_name, class_id, status } = req.body;

    const test = await findOneRecord(branchModels.StudentTest, { id: pk }, 60);
    if (!test) {
        return errorResponse(res, "Test not found!");
    }

    const existingTest = await findOneRecord(branchModels.StudentTest, { test_name: test_name }, 60);
    if (existingTest && existingTest.id !== parseInt(pk)) {
        return errorResponse(res, "Another test with this name already exists!");
    }
    const classes = await findOneRecord(branchModels.Class, { id: class_id }, 60);
    if (!classes) {
        return errorResponse(res, "Class not found!");
    }

    const updateData = {
        test_name: test_name,
        class_id: class_id,
        status: status
    };

    await updateRecord(branchModels.StudentTest, { id: pk }, updateData, "StudentTest");
    return successResponse(res, "Test data updated successfully.", null, true);
}));


router.delete("/delete-test/:pk", authenticateUser, authorizeRoles(1, 2), asyncHandler(async (req, res) => {
    const { pk } = req.params;

    const test = await findOneRecord(branchModels.StudentTest, { id: pk }, 60);
    if (!test) {
        return errorResponse(res, "Test not found!");
    }

    await deleteRecord(branchModels.StudentTest, { id: pk }, "StudentTest");
    return successResponse(res, "Test record deleted successfully!", null, true);
}));

module.exports = router;