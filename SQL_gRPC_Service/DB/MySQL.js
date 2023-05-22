const mysql = require('mysql');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { rejects } = require('assert');

// Create a connection to the Google Cloud MySQL instance
const connection = mysql.createConnection(
{
    host: '35.184.132.184',
    user: 'root',
    password: '1234',
    database: 'LuminaryLegendsTheatre',
});

function createUser(firstName, lastName, email, password)
{
    return new Promise((resolve, reject) =>
    {
        connection.connect((err) => {if (err) reject(err)});
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
        connection.end();
    })
}

function findAllUsers()
{
    return new Promise((resolve, reject) =>
    {
        connection.connect((err) => {if (err) reject(err)});
        connection.query('SELECT * FROM users', (err, results) => 
        {
            if (err) reject(err)
            resolve(results)
        });
        connection.end();
    })
}

function findUserById(userId)
{
    return new Promise((resolve, reject) =>
    {
        connection.connect((err) => {if (err) reject(err)});
        connection.query(`SELECT * FROM users where id = "${userId}"`, (err, results) => 
        {
            if (err) reject(err)
            resolve(results)
        });
        connection.end();
    })
}

function findUserByEmail(email) 
{
    return new Promise((resolve, reject) => 
    {
        connection.connect((err) => {if (err) reject(err)})
        connection.query(`SELECT * FROM users where email = "${email}"`, (err, results) => 
        {
            if (err) reject(err)
            resolve(results);
        });
        connection.end();
    });
}

function updateUser(userId, firstName, lastName, email, password)
{
    return new Promise((resolve, reject) =>
    {
        connection.connect((err) => {if (err) reject(err)});
        connection.query(`UPDATE users SET firstName = "${firstName}", lastName = "${lastName}", email = "${bcrypt.hashSync(email, 1)}", password = "${password}" WHERE id = "${userId}"`, 
        (err, results) => 
        {
            if (err) reject(err)
            resolve(results)
        });
        connection.end();
    })
}

function deleteUser(userId)
{
    return new Promise((resolve, reject) =>
    {
        connection.connect((err) => 
        {if (err) reject(err)});
        connection.query(`DELETE FROM users WHERE id = "${userId}"`, (err, results) => 
        {
            if (err) reject(err)
            resolve(results)
        });
        connection.end();
    })
}

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createMovie(title, description, runtime, rating, is_showing)
{
    return new Promise((resolve, reject) =>
    {
        connection.connect((err) => 
        {if (err) reject(err)});
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
        connection.end();
    })
}

function findAllMovies()
{
    return new Promise((resolve, reject) =>
    {
        connection.connect((err) => {if (err) reject(err)});
        connection.query('SELECT * FROM movies', (err, results) => 
        {
            if (err) reject(err)
            resolve(results)
        });
        connection.end();
    })
}

function findMovieById(movieId)
{
    return new Promise((resolve, reject) =>
    {
        connection.connect((err) => {if (err) reject(err) });
        connection.query(`SELECT * FROM movies where id = "${movieId}"`, (err, results) => 
        {
            if (err) reject(err)
            resolve(results)
        });
        connection.end();
    })
}

function findAllShowingMovies()
{
    return new Promise((resolve, reject) =>
    {
        connection.connect((err) => {if (err) reject(err)});
        connection.query('SELECT * FROM movies WHERE is_showing = true', (err, results) => 
        {
            if (err)reject(err)
            resolve(results)
        });
        connection.end();
    })
}

function updateMovie(movieId ,title, description, runtime, rating, is_showing)
{
    return new Promise((resolve, reject) => 
    {
        connection.connect((err) => {if (err) reject(err)});
        connection.query(`UPDATE movies SET title = "${title}", description = "${description}", runtime = "${runtime}", rating = "${rating}", is_showing = "${is_showing}" WHERE id = "${movieId}"`, 
        (err, results) => 
        {
            if (err) reject(err)
            resolve(results)
        });
        connection.end();
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
    console.log(bcrypt.compareSync(password, user.password));
}


exports.createUser = createUser
exports.findAllUsers = findAllUsers
exports.findUserById = findUserById
exports.updateUser = updateUser
exports.deleteUser = deleteUser

exports.createMovie = createMovie
exports.findAllMovies = findAllMovies
exports.findAllShowingMovies = findAllShowingMovies
exports.findMovieById = findMovieById
exports.updateMovie = updateMovie
exports.deleteMovie = deleteMovie

exports.validateUser = validateUser