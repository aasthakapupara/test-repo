const express = require('express');
const router = express.Router();

const attendanceRoutes = require('./attendance');

// Prefix all vendor routes with `/api/admin`
router.use('/', attendanceRoutes);

module.exports = router;
