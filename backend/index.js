const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const errorMiddleware = require("./middlewares/errorMiddleware");
const routes = require('./routes/router');
const path = require('path');

app.use(express.json());
app.use(cors());

app.use(routes);

app.get('/', (req, res) => {
    res.send('Welcome to Institute Management System!');
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 8523;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
