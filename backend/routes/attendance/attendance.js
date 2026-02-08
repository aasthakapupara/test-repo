const express = require("express");
const Sequelize = require("sequelize");
const router = express.Router();
const asyncHandler = require("../../middlewares/asyncHandler");
const { errorResponse, successResponse } = require("../../helpers/responseHelper");
const { startOfDay, endOfDay, getPresetDateRange, Op } = require('../../helpers/helperFunctions');
const authenticateUser = require("../../middlewares/auth");
const attendanceModels = require("../../models/Attendance");
const userModels = require("../../models/Admin");
const authorizeRoles = require("../../middlewares/authRoles");
const { findAllPaginatedRecords } = require("../../utils/dbUtils");

router.get("/attendance-list", authenticateUser, authorizeRoles(1, 2, 3), asyncHandler(async (req, res) => {
    const { role, id } = req.user;
    const { page = 1, limit = 20, start_date, end_date, filter, search, status } = req.query;

    let whereClause = {};

    if (role === 3) {
        whereClause.user_id = id;
    }

    if (filter === "custom") {
        if (!start_date || !end_date) {
            return errorResponse(res, "Start date and end date are required for custom filter", 400);
        }

        whereClause.date = {
            [Op.between]: [startOfDay(start_date), endOfDay(end_date)],
        };
    } else if ((start_date || end_date) && filter !== "custom") {
        return errorResponse(res, "Please select filter=custom to use start and end dates", 400);

    } else if (filter) {
        const range = getPresetDateRange(filter);
        if (range) {
            whereClause.date = {
                [Op.between]: [range.fromDate, range.toDate],
            };
        }

    } else {
        const range = getPresetDateRange("this_month");
        whereClause.date = {
            [Op.between]: [range.fromDate, range.toDate],
        };
    }

    if (status) {
        whereClause.status = status;
    }

    if (search && role !== 3) {
        const users = await userModels.User.findAll({
            attributes: ['id'],
            where: Sequelize.where(
                Sequelize.fn(
                    'CONCAT',
                    Sequelize.col('firstname'),
                    ' ',
                    Sequelize.col('lastname')
                ),
                {
                    [Op.like]: `%${search}%`
                }
            ),
            raw: true
        });

        const userIds = users.map(u => u.id);
        if (!userIds.length) {
            return successResponse(
                res,
                "Attendance list fetched successfully.",
                { rows: [], count: 0 },
                false
            );
        }

        whereClause.user_id = {
            [Op.in]: userIds
        };
    }

    const result = await attendanceModels.Attendance.findAndCountAll({
        where: whereClause,
        include: [
            { model: userModels.User, as: 'student', attributes: ['firstname', 'lastname', 'email'] },
            { model: require("../../models/Branch/branch"), as: 'branch', attributes: ['branch_name'] },
            { model: require("../../models/Branch/class"), as: 'class', attributes: ['class_name'] }
        ],
        order: [["date", "DESC"]],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
    });

    const pagination = {
        totalRecords: result.count,
        totalPages: Math.ceil(result.count / limit),
        currentPage: parseInt(page),
        pageSize: parseInt(limit),
    };

    return successResponse(res, "Attendance list fetched successfully.", { rows: result.rows, pagination }, false);
}));

module.exports = router;