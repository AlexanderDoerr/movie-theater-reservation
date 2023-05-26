const express = require('express');
const movieRoutes = require('./routes/movieRoutes');
const movieScheduleRoutes = require('./routes/movieScheduleRoutes');

// const sleep = require('sleep-promise');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use('/api', movieRoutes);
// app.use('/movie-schedule', movieScheduleRoutes);

// app.use(moviescheduler);

const port = process.env.PORT;

app.listen(port, () =>
{
    console.log(`Listening on port ${port}...`);
} );