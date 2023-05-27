const express = require('express');
const movieRoutes = require('./routes/movieRoutes');
const movieScheduleRoutes = require('./routes/movieScheduleRoutes');
const eurekaClient = require('./eurekaConfig');
const sleep = require('sleep-promise');
require('dotenv').config();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use("/movieService", movieRoutes);
app.use("/movie-schedule", movieScheduleRoutes);


app.listen(port, async () =>
{
  console.log(`Server running on port ${port}`);
  console.log('Waiting for 30 seconds before registering the service to Eureka...');
  await sleep(30000);
  console.log('Registering the service to Eureka...');
  eurekaClient.start();
} );

process.on('SIGINT', () => {
  console.log('Unregistering the service from Eureka...');
  eurekaClient.stop();
  process.exit();
});