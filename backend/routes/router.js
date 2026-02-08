const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const appsDir = path.join(__dirname); // This points to `routes/`

// Auto-load all app routes
fs.readdirSync(appsDir).forEach(app => {
    const appRoutesPath = path.join(appsDir, app, 'router.js');

    // Check if it's a directory and contains a `routes.js` file
    if (fs.existsSync(appRoutesPath) && fs.lstatSync(path.join(appsDir, app)).isDirectory()) {
        const appRoutes = require(appRoutesPath);
        router.use(`/api/${app}`, appRoutes); // Mount at /api/{app_name}
    }
});

module.exports = router;