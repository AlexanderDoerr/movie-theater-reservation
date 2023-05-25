const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../proto/movie.proto');

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });

const movielist_proto = grpc.loadPackageDefinition(packageDefinition).movielist;

const client = new movielist_proto.MovieList('localhost:50052', grpc.credentials.createInsecure());

exports.getMovieInfo = (req, res) => {
    client.GetMovieInfo({id: req.params.id}, function(err, response) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response);
        }
    });
};

exports.getAllMovies = (req, res) => {
    client.GetAllMovies({}, function(err, response) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response);
        }
    });
};

exports.getAllShowingMovies = (req, res) => {
    client.GetAllShowingMovies({}, function(err, response) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response);
        }
    });
};

exports.updateMovie = (req, res) => {
    client.UpdateMovie({uuid: req.params.id, is_showing: req.body.is_showing}, function(err, response) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response);
        }
    });
};
