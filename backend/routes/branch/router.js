const express = require('express');
const router = express.Router();

const branchRoutes = require('./branch');
const classRoutes = require('./class');
const courseRoutes = require('./course');
const subjectRoutes = require('./subject');
const facultyToBranchRoutes = require('./facultyToBranch');
const facultySubjectRoutes = require('./facultySubjects');
const studentResultsRoutes = require('./studentResult');
const studentTestRoutes = require('./studentTest');
const studentManagementRoutes = require('./studentManagement');
const studentSubjectRoutes = require('./studentSubject');

// Prefix all vendor routes with `/api/admin`
router.use('/', branchRoutes);
router.use('/', classRoutes);
router.use('/', courseRoutes);
router.use('/', subjectRoutes);
router.use('/', facultyToBranchRoutes);
router.use('/', facultySubjectRoutes);
router.use('/', studentResultsRoutes);
router.use('/', studentTestRoutes);
router.use('/', studentManagementRoutes);
router.use('/', studentSubjectRoutes);

module.exports = router;