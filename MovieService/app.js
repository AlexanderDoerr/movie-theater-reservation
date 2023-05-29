const express = require('express');
const movieListRoutes = require('./routes/movieListRoute');
const movieScheduleRoutes = require('./routes/schedulerRoute');
const eurekaClient = require('./eurekaConfig');
const sleep = require('sleep-promise');

const app = express();

app.use(express.json());
app.use("/api", movieListRoutes);
app.use("/api/schedule", movieScheduleRoutes);

port = process.env.PORT || 3000;
app.listen(port, async () => {
    console.log(`Server running on port ${port}`);
    console.log("Kafka Server Broker " + process.env.KAFKA_BROKER_SERVER)
    console.log(`Waiting for 15 seconds before registering with Eureka...`);
    await sleep(15000);
    console.log(`Registering with Eureka...`);
    eurekaClient.start();
});

process.on('SIGINT', () => {
    console.log(`\nShutting down...`);
    eurekaClient.stop();
    process.exit();
});