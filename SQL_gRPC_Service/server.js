const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const USER_PROTO_PATH = '../ProtoFiles/user.proto';
const userPackageDefinition = protoLoader.loadSync(USER_PROTO_PATH);
const userProto = grpc.loadPackageDefinition(userPackageDefinition).users;

const MOVIE_PROTO_PATH = '../ProtoFiles/movie.proto';
const moviePackageDefinition = protoLoader.loadSync(MOVIE_PROTO_PATH);
const movieProto = grpc.loadPackageDefinition(moviePackageDefinition).movielist;

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

