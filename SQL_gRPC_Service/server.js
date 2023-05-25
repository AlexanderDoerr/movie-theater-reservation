const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const db = require("./DB/MySQL")

const USER_PROTO_PATH = './protos/user.proto';
const userPackageDefinition = protoLoader.loadSync(USER_PROTO_PATH);
const userProto = grpc.loadPackageDefinition(userPackageDefinition).users;

const MOVIE_PROTO_PATH = './protos/movie.proto';
const moviePackageDefinition = protoLoader.loadSync(MOVIE_PROTO_PATH);
const movieProto = grpc.loadPackageDefinition(moviePackageDefinition).movielist;

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function getAllMovies(call ,callback)
{
    callback(null, db.getAllMovies())
}

// db.createMovie("title 1", "description 1", "runtime 1", "rating 1", true);
// db.createMovie("title 2", "description 2", "runtime 2", "rating 2", false);
// db.createMovie("title 3", "description 3", "runtime 3", "rating 3", true);

function main() 
{
    const server = new grpc.Server();
    server.addService(movieProto.MovieList.service, {
        getAllMovies: getAllMovies,
    });
    server.bind('localhost:50052', grpc.ServerCredentials.createInsecure());
    server.start();
    console.log('Server running at http://localhost:50052');
}

main();