const express = require('express');
const movieRoutes = require('./routes/movieRoutes');
const movieScheduleRoutes = require('./routes/movieScheduleRoutes');
require('dotenv').config();
const registerWithConsul = require('./consulConfig');

// const sleep = require('sleep-promise');


const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use('/movies', movieRoutes);
// app.use('/movie-schedule', movieScheduleRoutes);

// app.use(moviescheduler);



app.get('/health', (req, res) => {
    res.sendStatus(200);
  });

app.listen(port, () =>
{
    console.log(`Listening on port ${port}...`);
    registerWithConsul();
} );