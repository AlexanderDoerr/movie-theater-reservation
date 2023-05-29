// import library
const {Kafka} = require("kafkajs");
const{KAFKA_USERNAME: username, KAFKA_PASSWORD: password, KAFKA_BROKER_SERVER: broker} = process.env;
const sasl = username && password ? {username, password, mechanism: 'plain'} : null;
const ssl = !!sasl

// create a client connection
const kafka = new Kafka(
    {
        brokers:[broker],
        clientId: "email-consumer",
        ssl,
        sasl
    }
)

module.exports = kafka;