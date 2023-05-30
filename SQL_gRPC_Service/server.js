const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const db = require("./DB/MySQL")
const kafkaServer = require("./kafkaConsumer");

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
        console.log(movies + "\n\n\n")
        for (const movie of movies) {
            response.movies.push({
                uuid: movie.id,
                title: movie.title,
                description: movie.description,
                runtime: movie.runtime,
                rating: movie.rating,
                isShowing: movie.is_showing === "true",
            });
        }
        console.log(response)
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
        isShowing: movie.is_showing === "true"
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
            description: movie.description,
            runtime: movie.runtime,
            rating: movie.rating,
            isShowing: movie.is_showing === "true"
        });
        }

    callback(null, response);
} catch (error) {
    console.error('Error fetching movies:', error);
    callback(error);
}
}

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function createUser(call, callback)
{
    try
    {
        let users = await db.findAllUsers();
        let validUser = true;
        for(const user of users)
        {
            if(call.request.email == user.email)
            {
                console.log("Matching email found: " + call.request.email + " match db " + user.email)
                validUser = false;
            }
        }
        if(validUser)
        {
            await db.createUser(call.request.firstname, call.request.lastname, call.request.email, call.request.password)
            userId = (await db.findUserByEmail(call.request.email))[0].id;
            let response =
            {
                UUID : userId
            }
            console.log(response)
            callback(null, response)
        }
        else
        {
            let response = 
            {
                UUID: ""
            }
            callback(null, response)
        }
    }
    catch(err)
    {
        console.log("Error Creating User: " + err);
        callback(null, err);
    }
}

async function getUserById(call, callback)
{
    try{
        console.log(call.request)
        let user = (await db.findUserById(call.request.UUID))[0]
        let response = 
        {
            userGuid: user.id,
            firstname: user.firstName,
            lastname: user.lastName,
            email: user.email,
            createdDate: user.created
        }
        console.log(response)
        callback(null, response);
    }
    catch(err)
    {
        console.log("Error finding user by id " + err);
        callback(null, err)
    }
}

async function getUserByEmail(call, callback)
{
    try{
        let user = (await db.findUserByEmail(call.request.email))[0]
        console.log(call.request.email)
        let response = 
        {
            userGuid: user.id,
            firstname: user.firstName,
            lastname: user.lastName,
            email: user.email,
            createdDate: user.created
        }
        callback(null, response);
    }
    catch(err)
    {
        console.log("Error finding user by email " + err);
        callback(null, err)
    }
}

async function validateUser(call, callback)
{
    try
    {
        console.log(call.request.email + " " + call.request.password)
        let userId = await db.validateUser(call.request.email, call.request.password)
        if(userId != "Invalid Email or Password")
        {
            let response =
            {
                UUID : userId
            }
            console.log("response" + response)
            callback(null, response)
        }
        else
        {
            let response = 
            {
                UUID : ""
            }
            callback(null, response);
        }
        
        
    }
    catch(err){
        console.log("Error validating user: " + err)
        callback(null, err);
    }
}

async function getAllUsers(call, callback) {
    try {
        const users = await db.findAllUsers();
        const response = { users: [] };
        
        for (const user of users) {
            response.users.push({
                userGuid: user.id,
                firstname: user.firstName,
                lastname: user.lastName,
                email: user.email,
                password: user.password,
                createdDate: user.created
            });
        }
        callback(null, response);
    } catch (error) {
        console.error('Error fetching users:', error);
        callback(error);
    }
}

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function main() 
{
    const server = new grpc.Server();
    server.addService(movieProto.MovieList.service, {
        getAllMovies: getAllMovies,
        getMovieInfo: getMovieInfo,
        getAllShowingMovies: getAllShowingMovies
    });
    server.addService(userProto.UserService.service,
        {
            getUserById: getUserById,
            getUserByEmail: getUserByEmail,
            validateUser: validateUser,
            getAllUsers: getAllUsers,
            createUser: createUser
        });
    server.bindAsync('0.0.0.0:50052', grpc.ServerCredentials.createInsecure(), (err) =>
    {
        if(err) console.log(err);
        else
        {
            server.start();
            kafkaServer.start();
            db.createConnection();
            console.log("Kafka Server Broker " + process.env.KAFKA_BROKER_SERVER)

            // db.createMovie("title", "description", "oire[owvn", "ribvipv", "false")
            console.log('Server running at http://localhost:50052');
        } 
    });

}

exports.getAllMovies = getAllMovies;
exports.createUser = createUser;

main();