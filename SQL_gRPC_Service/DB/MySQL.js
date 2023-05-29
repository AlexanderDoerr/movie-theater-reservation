const mysql = require('mysql');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Create a connection to the Google Cloud MySQL instance
const connection = mysql.createConnection(
{
    host: '35.184.132.184',
    user: 'root',
    password: '1234',
    database: 'LuminaryLegendsTheatre',
});

function createConnection()
{
    connection.connect((err) => {if (err) reject(err)});
}

function endConnection ()
{
    connection.end();
}


function createUser(firstName, lastName, email, password)
{
    return new Promise((resolve, reject) =>
    {
        connection.query(`INSERT INTO users (id, firstName, lastName, email, password, created) VALUES (?,?,?,?,?,?)`,
        [
            crypto.randomUUID(),
            firstName,
            lastName,
            email,
            bcrypt.hashSync(password, 1),
            Date.now()
        ],
        (err, results)=>
        {
            if(err) reject(err);
            resolve(results);
        })
    })
}

function findAllUsers()
{
    return new Promise((resolve, reject) =>
    {
        connection.query('SELECT * FROM users', (err, results) => 
        {
            if (err) reject(err)
            resolve(results)
        });
    })
}

function findUserById(userId)
{
    return new Promise((resolve, reject) =>
    {
        connection.query(`SELECT * FROM users where id = "${userId}"`, (err, results) => 
        {
            if (err) reject(err)
            resolve(results)
        });
    })
}

function findUserByEmail(email) 
{
    return new Promise((resolve, reject) => 
    {
        connection.query(`SELECT * FROM users where email = "${email}"`, (err, results) => 
        {
            if (err) reject(err)
            resolve(results);
        });
    });
}

function updateUser(userId, firstName, lastName, email, password)
{
    return new Promise((resolve, reject) =>
    {
        connection.query(`UPDATE users SET firstName = "${firstName}", lastName = "${lastName}", email = "${bcrypt.hashSync(email, 1)}", password = "${password}" WHERE id = "${userId}"`, 
        (err, results) => 
        {
            if (err) reject(err)
            resolve(results)
        });
    })
}

function deleteUser(userId)
{
    return new Promise((resolve, reject) =>
    {
        connection.query(`DELETE FROM users WHERE id = "${userId}"`, (err, results) => 
        {
            if (err) reject(err)
            resolve(results)
        });
    })
}

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createMovie(title, description, runtime, rating, is_showing)
{
    return new Promise((resolve, reject) =>
    {
        connection.query(`INSERT INTO movies (id, title, description, runtime, rating, is_showing) VALUES (?,?,?,?,?,?)`,
        [
            crypto.randomUUID(),
            title,
            description,
            runtime,
            rating,
            is_showing
        ],
        (err, results)=>
        {
            if(err) reject(err)
            resolve(results)
        })
    })
}

function findAllMovies()
{
    return new Promise((resolve, reject) =>
    {
        connection.query('SELECT * FROM movies', (err, results) => 
        {
            if (err) reject(err)
            resolve(results)
        });
    })
}

function findMovieById(movieId)
{
    return new Promise((resolve, reject) =>
    {
        connection.query(`SELECT * FROM movies where id = "${movieId}"`, (err, results) => 
        {
            if (err) reject(err)
            resolve(results)
        });
    })
}

function findAllShowingMovies()
{
    return new Promise((resolve, reject) =>
    {
        connection.query('SELECT * FROM movies WHERE is_showing = "true"', (err, results) => 
        {
            if (err)reject(err)
            resolve(results)
        });
    })
}

function updateMovie(movieId ,title, description, runtime, rating, is_showing)
{
    return new Promise((resolve, reject) => 
    {
        let sql = `UPDATE movies SET title = "${title}", description = "${description}", runtime = "${runtime}", rating = "${rating}", is_showing = "${is_showing}" WHERE id = "${movieId}"`;
        console.log("\n\n\n\n\n\n\n" + sql)
        connection.query(sql, 
        (err, results) => 
        {
            if (err) reject(err)
            resolve(results)
        });
    })
}

function deleteMovie(movieId)
{
    return new Promise((resolve, reject) =>
    {
        connection.connect((err) => {if (err) reject(err)});
        connection.query(`DELETE FROM movies WHERE id = "${movieId}"`, 
        (err, results) => 
        {
            if (err) reject(err)
            resolve(results)
        });
        connection.end();
    })
}

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function validateUser(email, password)
{
    user = (await findUserByEmail(email))[0];
    if(bcrypt.compareSync(password, user.password))
        return user.id;
    else    
        return "Invalid Email or Password"
}


exports.createUser = createUser
exports.findAllUsers = findAllUsers
exports.findUserById = findUserById
exports.findUserByEmail = findUserByEmail
exports.updateUser = updateUser
exports.deleteUser = deleteUser

exports.createMovie = createMovie
exports.findAllMovies = findAllMovies
exports.findAllShowingMovies = findAllShowingMovies
exports.findMovieById = findMovieById
exports.updateMovie = updateMovie
exports.deleteMovie = deleteMovie

exports.validateUser = validateUser
exports.createConnection = createConnection
exports.endConnection = endConnection