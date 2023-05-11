const express = require('express');
// const moviescheduler = require('./routes/movie-scheduler-route');
// const sleep = require('sleep-promise');
require('dotenv').config();

const app = express();

app.use(express.json());
// app.use(moviescheduler);

const port = process.env.PORT;

app.listen(port, () =>
{
    console.log(`Listening on port ${port}...`);
} );