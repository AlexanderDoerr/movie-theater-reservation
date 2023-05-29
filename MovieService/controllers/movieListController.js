const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const kafka = require('../stream/kafka');

const producer = kafka.producer();

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

let client;
const maxRetries = 10;
let retryCount = 0;

const createClient = () => {
    try {
        client = new movielist_proto.MovieList('Sql-gRPC-Service:50052', grpc.credentials.createInsecure());
        console.log('Successfully connected to MovieList gRPC server');
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

const getMovieInfo = (req, res) => {
    if (client) {
        client.GetMovieInfo({id: req.params.id}, function(err, response) {
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

const getAllMovies = (req, res) => {
    if (client) {
        client.GetAllMovies({}, function(err, response) {
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

const getAllShowingMovies = (req, res) => {
    if (client) {
        client.GetAllShowingMovies({}, function(err, response) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json(response);
            }
        });
    } else {
        res.status(500).send("gRPC client is not initialized yet.");
    }
};

const updateMovie = async (req, res) => {
    try {
        await producer.connect()

        await producer.send(
            {
                topic: "movies",
                messages:
                [
                    {
                        key: "movie-updated",
                        value: JSON.stringify(
                            {
                                movieId: req.params.id,
                                title: req.body.title,
                                description: req.body.description,
                                runtime: req.body.runtime,
                                rating: req.body.rating,
                                is_showing: req.body.is_showing
                            }
                        )
                    }
                ]
            }
        )

        res.send("Movie Updated")

    } catch (error) {
        console.error('Error updating movie:', error);
        res.status(500).send('Error updating movie');
    }
};


module.exports = {
    getAllMovies,
    getMovieInfo,
    getAllShowingMovies,
    updateMovie
}
