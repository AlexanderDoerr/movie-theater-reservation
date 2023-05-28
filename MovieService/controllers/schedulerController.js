const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { Timestamp } = require('google-protobuf/google/protobuf/timestamp_pb.js');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../proto/scheduler.proto');

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });

const movieschedule_proto = grpc.loadPackageDefinition(packageDefinition).seatavailability;

let client;
const maxRetries = 10;
let retryCount = 0;

const createClient = () => {
    try {
        client = new movieschedule_proto.MovieScheduleService('Firebase-Service-Python:50051', grpc.credentials.createInsecure());
        console.log('Successfully connected to gRPC server');
    } catch (error) {
        console.error('Failed to create gRPC client:', error);
        retryCount++;

        if (retryCount < maxRetries) {
            setTimeout(createClient, 5000);  // Try again after a delay
        } else {
            console.error('Failed to create gRPC client after ' + maxRetries + ' attempts.');
        }
    }
}

createClient();

const addMovieToSchedule = (req, res) => {
    if (client) {
        const timestamp = new Timestamp();
        timestamp.fromDate(new Date(req.body.time));

        client.AddMovieToSchedule({
            movie_uuid: req.body.movie_uuid, 
            auditorium_num: req.body.auditorium_num, 
            time: timestamp
        }, function(err, response) {
            if (err) {
                res.status(500).send(err);
            } else {
                console.log(response);
                res.json(response);
            }
        });
    } else {
        res.status(500).send("gRPC client is not initialized yet.");
    }
};

const getAudSchedulesByDate = (req, res) => {
    if (client) {
        client.GetAudSchedulesByDate({date: req.body.date}, function(err, response) {
            if (err) {
                res.status(500).send(err);
            } else {
                console.log(response);
                res.json(response);
            }
        });
    } else {
        res.status(500).send("gRPC client is not initialized yet.");
    }
};

const reserveSeat = (req, res) => {
    if (client) {
        client.ReserveSeat({uuid: req.body.uuid}, function(err, response) {
            if (err) {
                res.status(500).send(err);
            } else {
                console.log(response);
                res.json(response);
            }
        });
    } else {
        res.status(500).send("gRPC client is not initialized yet.");
    }
};

const getShowtimesByDateAndMovieUuid = (req, res) => {
    if (client) {
        client.GetShowtimesByDateAndMovieUuid({
            movie_uuid: req.body.movie_uuid, 
            date: req.body.date
        }, function(err, response) {
            if (err) {
                res.status(500).send(err);
            } else {
                console.log(response);
                res.json(response);
            }
        });
    } else {
        res.status(500).send("gRPC client is not initialized yet.");
    }
};

const getSeats = (req, res) => {
    if (client) {
        const timestamp = new Timestamp();
        timestamp.fromDate(new Date(req.body.date));
        
        client.GetSeats({
            auditorium_uuid: req.body.auditorium_uuid, 
            date: timestamp, 
            time: req.body.time
        }, function(err, response) {
            if (err) {
                res.status(500).send(err);
            } else {
                console.log(response);
                res.json(response);
            }
        });
    } else {
        res.status(500).send("gRPC client is not initialized yet.");
    }
};

module.exports = {
    addMovieToSchedule,
    getAudSchedulesByDate,
    reserveSeat,
    getShowtimesByDateAndMovieUuid,
    getSeats
}

