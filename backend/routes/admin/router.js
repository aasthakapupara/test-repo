const express = require('express');
const router = express.Router();

const branchRoutes = require('./branch');
const classRoutes = require('./class');
const courseRoutes = require('./course');
const subjectRoutes = require('./subjects');
const facultyToBranchRoutes = require('./facultyToBranch');
const facultySubjectRoutes = require('./facultySubject');
const studentTestRoutes = require('./studentTests');
const studentResultRoutes = require('./studentResults');
const attendanceRoutes = require('./attendance');
const studentManagementRoutes = require('./studentManagement');
const studentSubjectRoutes = require('./studentSubjects');

// Prefix all vendor routes with `/api/admin`
router.use('/', branchRoutes);
router.use('/', classRoutes);
router.use('/', courseRoutes);
router.use('/', subjectRoutes);
router.use('/', facultyToBranchRoutes);
router.use('/', facultySubjectRoutes);
router.use('/', studentTestRoutes);
router.use('/', studentResultRoutes);
router.use('/', attendanceRoutes);
router.use('/', studentManagementRoutes);
router.use('/', studentSubjectRoutes);

module.exports = router;
