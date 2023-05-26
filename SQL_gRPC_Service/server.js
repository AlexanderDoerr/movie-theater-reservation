const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const db = require("./DB/MySQL")

const USER_PROTO_PATH = './protos/user.proto';
const userPackageDefinition = protoLoader.loadSync(USER_PROTO_PATH);
const userProto = grpc.loadPackageDefinition(userPackageDefinition).users;

const MOVIE_PROTO_PATH = './protos/movie.proto';
const moviePackageDefinition = protoLoader.loadSync(MOVIE_PROTO_PATH);
const movieProto = grpc.loadPackageDefinition(moviePackageDefinition).movielist;

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////


async function getAllMovies(call, callback) {
    try {
        const movies = await db.findAllMovies();
        const response = { movies: [] };
        
        for (const movie of movies) {
        response.movies.push({
            uuid: movie.id,
            title: movie.title,
            description: movie.description,
            runtime: movie.runtime,
            rating: movie.rating,
            is_showing: movie.is_showing,
        });
        }

    callback(null, response);
} catch (error) {
    console.error('Error fetching movies:', error);
    callback(error);
}
}


async function getMovieInfo(call, callback) {
    try {
        const movie = (await db.findMovieById(call.request.id))[0];
        const response = {
        uuid: movie.id,
        title: movie.title,
        description: movie.description,
        runtime: movie.runtime,
        rating: movie.rating,
        is_showing: movie.is_showing,
        };
        callback(null, response);
    } catch (error) {
        console.error('Error fetching movie information:', error);
        callback(error);
    }
    }

async function getAllShowingMovies(call, callback)
{
    try {
        const movies = await db.findAllShowingMovies();
        const response = { movies: [] };
        
        for (const movie of movies) {
            if(!movie){
                console.error("Encounter undefinded movie")
                continue;
            }
        response.movies.push({
            uuid: movie.id,
            title: movie.title,
            // description: movie.description,
            // runtime: movie.runtime,
            // rating: movie.rating,
            // is_showing: movie.is_showing,
        });
        }

    callback(null, response);
} catch (error) {
    console.error('Error fetching movies:', error);
    callback(error);
}
}



// db.createMovie("title 1", "description 1", "runtime 1", "rating 1", true);
// db.createMovie("title 2", "description 2", "runtime 2", "rating 2", false);
// db.createMovie("title 3", "description 3", "runtime 3", "rating 3", true);

function main() 
{
    const server = new grpc.Server();
    server.addService(movieProto.MovieList.service, {
        getAllMovies: getAllMovies,
        getMovieInfo: getMovieInfo,
        getAllShowingMovies: getAllShowingMovies
    });
    server.bindAsync('localhost:50052', grpc.ServerCredentials.createInsecure(), (err) =>
    {
        if(err) console.log(err);
        else
        {
            server.start();
            db.createConnection()
            console.log('Server running at http://localhost:50052');
        } 
    });

}

main();