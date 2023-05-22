// import library
const {Kafka} = require("kafkajs");
const{KAFKA_USERNAME: username, KAFKA_PASSWORD: password} = process.env;
const sasl = username && password ? {username, password, mechanism: 'plain'} : null;
const ssl = !!sasl

// create a client connection
const kafka = new Kafka(
    {
        brokers:[process.env.KAFKA_BROKER_SERVER],
        clientId: "task-manager-producer-cart",
        ssl,
        sasl
    }
)

module.exports = kafka;