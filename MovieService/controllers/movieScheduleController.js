// const grpc = require('@grpc/grpc-js');
// const protoLoader = require('@grpc/proto-loader');
// const path = require('path');

// const PROTO_PATH = path.join(__dirname, '../proto/scheduler.proto');
// // const PROTO_PATH = '../proto/scheduler.proto';

// const packageDefinition = protoLoader.loadSync(
//     PROTO_PATH,
//     {keepCase: true,
//      longs: String,
//      enums: String,
//      defaults: true,
//      oneofs: true
//     });

// const movieScheduleService_proto = grpc.loadPackageDefinition(packageDefinition).MovieScheduleService;

// const client = new movieScheduleService_proto.MovieScheduleService('localhost:50051', grpc.credentials.createInsecure());

// exports.addMovieToSchedule = (req, res) => {
//     client.AddMovieToSchedule(req.body, function(err, response) {
//         if (err) {
//             res.status(500).send(err);
//         } else {
//             res.json(response);
//         }
//     });
// };

// exports.getAudSchedulesByDate = (req, res) => {
//     client.GetAudSchedulesByDate({date: req.params.date}, function(err, response) {
//         if (err) {
//             res.status(500).send(err);
//         } else {
//             res.json(response);
//         }
//     });
// };

// exports.reserveSeat = (req, res) => {
//     client.ReserveSeat(req.body, function(err, response) {
//         if (err) {
//             res.status(500).send(err);
//         } else {
//             res.json(response);
//         }
//     });
// };

// exports.getShowtimesByDateAndMovieUuid = (req, res) => {
//     client.GetShowtimesByDateAndMovieUuid(req.body, function(err, response) {
//         if (err) {
//             res.status(500).send(err);
//         } else {
//             res.json(response);
//         }
//     });
// };

// exports.scheduleMovieEvent = (req, res) => {
//     client.ScheduleMovieEvent(req.body, function(err, response) {
//         if (err) {
//             res.status(500).send(err);
//         } else {
//             res.json(response);
//         }
//     });
// };

// exports.getSeats = (req, res) => {
//     client.GetSeats(req.body, function(err, response) {
//         if (err) {
//             res.status(500).send(err);
//         } else {
//             res.json(response);
//         }
//     });
// };
