const express = require('express');
const router = express.Router();

const userRoutes = require('./users');

// Prefix all vendor routes with `/api/admin`
router.use('/', userRoutes);

module.exports = router;
