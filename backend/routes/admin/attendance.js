const express = require("express");
const router = express.Router();
const asyncHandler = require("../../middlewares/asyncHandler");
const { errorResponse, successResponse } = require("../../helpers/responseHelper");
const authenticateUser = require("../../middlewares/auth");
const authorizeRoles = require("../../middlewares/authRoles");
const { createRecord, findOneRecord, updateRecord, deleteRecord } = require("../../utils/dbUtils");
const userModels = require("../../models/Admin");
const attendanceModels = require("../../models/Attendance");
const csv = require("csv-parser");
const { uploadCSV } = require("../../middlewares/upload");
const { Readable } = require("stream");

router.post("/add-attendance", authenticateUser, authorizeRoles(1, 2), uploadCSV, asyncHandler(async (req, res) => {

    if (!req.file) {
        return errorResponse(res, "CSV file is required!");
    }

    const rows = [];
    const stream = Readable.from(req.file.buffer);

    stream
        .pipe(csv())
        .on("data", (row) => {
            rows.push(row);
        })
        .on("end", async () => {

            let inserted = 0;
            let skipped = 0;

            for (const row of rows) {

                const email = row["Email"]?.trim();
                const date = row["Attendance Date"];
                const status = row["Attendance Status"]?.toLowerCase() === "present" ? "present" : "absent";

                if (!email || !date) {
                    skipped++;
                    continue;
                }

                /* ---- FIND USER BY EMAIL ---- */
                const user = await findOneRecord(userModels.User, { email: email }, 60);
                if (!user) {
                    skipped++;
                    continue;
                }

                const existingAttendance = await findOneRecord(attendanceModels.Attendance, { user_id: user.id, date: date }, 60);
                if (existingAttendance) {
                    skipped++;
                    continue;
                }
                const attendanceData = {
                    user_id: user.id,
                    date: date,
                    status: status
                };
                try {
                    await createRecord(attendanceModels.Attendance, attendanceData, "Attendance");
                    inserted++;
                } catch (err) {
                    if (err.name === "SequelizeUniqueConstraintError") {
                        skipped++;
                    } else {
                        throw err;
                    }
                }
            }
            return successResponse(res, "Attendance uploaded successfully.", { inserted, skipped }, true);
        });
}));

router.put("/edit-attendance/:pk", authenticateUser, authorizeRoles(1, 2), asyncHandler(async (req, res) => {
    const { pk } = req.params;
    const { user_id, date, status } = req.body;

    const attendance = await findOneRecord(attendanceModels.Attendance, { id: pk }, 60);
    if (!attendance) {
        return errorResponse(res, "Attendance record not found!");
    }

    const user = await findOneRecord(userModels.User, { id: user_id }, 60);
    if (!user) {
        return errorResponse(res, "User not found!");
    }

    const updateData = {
        user_id: user_id,
        date: date,
        status: status,
    };

    await updateRecord(attendanceModels.Attendance, { id: pk }, updateData, "Attendance");
    return successResponse(res, "Attendance record updated successfully.", null, true);
}));

router.delete("/delete-attendance/:pk", authenticateUser, authorizeRoles(1, 2), asyncHandler(async (req, res) => {
    const { pk } = req.params;

    const attendance = await findOneRecord(attendanceModels.Attendance, { id: pk }, 60);
    if (!attendance) {
        return errorResponse(res, "Attendance record not found!");
    }

    await deleteRecord(attendanceModels.Attendance, { id: pk }, "Attendance");
    return successResponse(res, "Attendance record deleted successfully!", null, true);
}));

router.get("/attendance/download", authenticateUser, authorizeRoles(1, 2), asyncHandler(async (req, res) => {
    const { branch_id, class_id, date } = req.query;

    let whereClause = {};
    if (branch_id) whereClause.branch_id = branch_id;
    if (class_id) whereClause.class_id = class_id;
    if (date) whereClause.date = date;

    const records = await attendanceModels.Attendance.findAll({
        where: whereClause,
        include: [
            { model: userModels.User, as: 'student', attributes: ['firstname', 'lastname', 'email'] },
            { model: require("../../models/Branch/branch"), as: 'branch', attributes: ['branch_name'] },
            { model: require("../../models/Branch/class"), as: 'class', attributes: ['class_name'] }
        ]
    });

    let csvContent = "Student Name,Email,Branch,Class,Date,Status\n";
    records.forEach(r => {
        csvContent += `${r.student?.firstname} ${r.student?.lastname},${r.student?.email},${r.branch?.branch_name},${r.class?.class_name},${r.date},${r.status}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=attendance_${date || 'report'}.csv`);
    return res.status(200).send(csvContent);
}));

module.exports = router;
