const mysql = require('mysql');
const crypto = require('crypto');

// Create a connection to the Google Cloud MySQL instance
const connection = mysql.createConnection({
  host: '35.184.132.184',
  user: 'root',
  password: '1234',
  database: 'LuminaryLegendsTheatre',
});

// Connect to the database
// connection.connect((err) => {
//   if (err) {
//     console.error('Error connecting to the database:', err);
//     return;
//   }
//   console.log('Connected to the database!');
// });


function createUser(firstName, lastName, email, password)
{
    connection.connect((err) => 
    {
        if (err) 
        {
            console.error('Error connecting to the database:', err);
            return;// Return server error
        }
    });
    connection.query(`INSERT INTO users (Id, firstName, lastName, email, password) VALUES (?,?,?,?,?)`,
    [
        crypto.randomUUID(),
        firstName,
        lastName,
        email,
        password
    ],
    (err, results)=>
    {
        if(err) console.log(err);
    })
    connection.end();
    
}

function findAllUsers()
{
    connection.connect((err) => 
    {
        if (err) 
        {
            console.error('Error connecting to the database:', err);
            return;
        }
    });
    connection.query('SELECT * FROM users', (err, results) => 
    {
        if (err)
        {
            console.error('Error querying the database:', err);
            return;
        }
        console.log('Query results:', results);
    });
    connection.end();
}

function findUserById(userId)
{
    connection.connect((err) => 
    {
        if (err) 
        {
            console.error('Error connecting to the database:', err);
            return;
        }
    });
    connection.query(`SELECT * FROM users where Id = "${userId}"`, (err, results) => 
    {
        if (err)
        {
            console.error('Error querying the database:', err);
            return;
        }
        console.log('Query results:', results);
    });
    connection.end();
}

// createUser("Alex", "Kugle", "email", "testFunction") // Is functional needs to return response codes

// findAllUsers()

findUserById('662ecb6c-8fe1-486f-bf96-a41b094fff40')