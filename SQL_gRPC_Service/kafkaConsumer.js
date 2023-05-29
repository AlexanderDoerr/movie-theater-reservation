const kafka = require("./streams/kafka.js");
const db  = require("./DB/MySQL.js");

start  = async () =>
{
    consumer = kafka.consumer({groupId: "service-consumer-group"});
    await consumer.connect();

    await consumer.subscribe({topics: ['users','movies']});
    await consumer.run(
        {
            eachMessage: async({topic, patition, message, heartbeat, pause}) =>
            {
                let key = message.key.toString();
                switch(key)
                {
                    case "user-updated":
                        {
                            let jsonMessage = JSON.parse(message.value.toString());
                            db.updateUser(jsonMessage['userId'],jsonMessage['firstName'],jsonMessage['lastName'],jsonMessage['email'],jsonMessage['password'])
                            break;
                        }
                    case "user-deleted":
                        {
                            db.deleteUser(message.value.toString())
                            break;
                        }
                    case "movie-updated":
                        {
                            let jsonMessage = JSON.parse(message.value.toString());
                            console.log("\n\n\n\n\n\n\n\n\n" + jsonMessage);
                            db.updateMovie(jsonMessage['movieId'], jsonMessage['title'],jsonMessage['description'],jsonMessage['runtime'],jsonMessage['rating'],jsonMessage['is_showing'])
                            break;
                        }
                    case "movie-deleted":
                        {
                            db.deleteMovie(message.value.toString())
                            break;
                        }
                }
                
            }
        }
        ) 
    } 

exports.start = start