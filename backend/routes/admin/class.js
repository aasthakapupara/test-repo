const express = require("express");
const router = express.Router();
const asyncHandler = require("../../middlewares/asyncHandler");
const { errorResponse, successResponse } = require("../../helpers/responseHelper");
const { currentDate } = require("../../helpers/helperFunctions");
const authenticateUser = require("../../middlewares/auth");
const authorizeRoles = require("../../middlewares/authRoles");
const branchModels = require("../../models/Branch");
const { createRecord, findOneRecord, updateRecord, deleteRecord } = require("../../utils/dbUtils");

router.post("/add-class", authenticateUser, authorizeRoles(1), asyncHandler(async (req, res) => {
    const { class_name, class_slug } = req.body;

    const existingClass = await findOneRecord(branchModels.Class, { class_name: class_name }, 60);
    if (existingClass) {
        return errorResponse(res, "Class with this name already exists!");
    }

    const classData = {
        class_name: class_name,
        class_slug: class_slug,
        created_at: currentDate()
    };

    try {
        await createRecord(branchModels.Class, classData, "Class");
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return errorResponse(res, "Class slug already exists!");
        }
        throw err;
    }
    return successResponse(res, "Class added successfully.", null, true);
}));

router.put("/edit-class/:pk", authenticateUser, authorizeRoles(1), asyncHandler(async (req, res) => {
    const { pk } = req.params;
    const { class_name, class_slug, status } = req.body;
    console.log(`Editing Class ${pk} with body:`, req.body);

    const classRecord = await findOneRecord(branchModels.Class, { id: pk }, 60);
    if (!classRecord) {
        console.log(`Class ${pk} not found during edit.`);
        return errorResponse(res, "Class not found!");
    }

    if (class_name) {
        const existingClass = await findOneRecord(branchModels.Class, { class_name: class_name }, 60);
        if (existingClass && existingClass.id !== parseInt(pk)) {
            return errorResponse(res, "Another class with this name already exists!");
        }
    }

    const updateData = {
        class_name: class_name || classRecord.class_name,
        class_slug: class_slug || classRecord.class_slug,
        status: status !== undefined ? status : classRecord.status
    };

    try {
        await updateRecord(branchModels.Class, { id: pk }, updateData, "Class");
        return successResponse(res, "Class data updated successfully.", null, true);
    } catch (err) {
        console.error("Error updating class:", err);
        return errorResponse(res, "Failed to update class data.");
    }
}));


router.delete("/delete-class/:pk", authenticateUser, authorizeRoles(1), asyncHandler(async (req, res) => {
    const { pk } = req.params;
    console.log(`Deleting Class ${pk}.`);

    const classes = await findOneRecord(branchModels.Class, { id: pk }, 60);
    if (!classes) {
        return errorResponse(res, "Class not found!");
    }

    await deleteRecord(branchModels.Class, { id: pk }, "Class");
    return successResponse(res, "Class deleted successfully!", null, true);
}));

module.exports = router;