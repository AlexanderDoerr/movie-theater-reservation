// // import library
// const {Kafka} = require("kafkajs");
// const{KAFKA_USERNAME: username, KAFKA_PASSWORD: password} = process.env;
// const sasl = username && password ? {username, password, mechanism: 'plain'} : null;
// const ssl = !!sasl

// // create a client connection
// const kafka = new Kafka(
//     {
//         brokers:[process.env.KAFKA_BROKER_SERVER],
//         // brokers:['localhost:9092'],
//         clientId: "movie-service-producer",
//         ssl,
//         sasl
//     }
// )

// module.exports = kafka;

// import library
const {Kafka} = require("kafkajs");

const {KAFKA_USERNAME: username, KAFKA_PASSWORD: password, KAFKA_BROKER_SERVER: broker} = process.env;

if (!broker) {
    throw new Error("Please define the KAFKA_BROKER_SERVER environment variable");
}

const sasl = username && password ? {username, password, mechanism: 'plain'} : null;
const ssl = !!sasl

// Logging for KafkaJS
const logLevel = process.env.KAFKAJS_LOG_LEVEL || 'nothing';

// create a client connection
const kafka = new Kafka(
    {
        brokers: [broker],
        clientId: "movie-service-producer",
        ssl,
        sasl,
        logLevel
    }
)

module.exports = kafka;
