const kafka = require("./streams/kafka.js");
const db  = require("./DB/MySQL.js");

main  = async () =>
{
    consumer = kafka.consumer({groupId: "service-consumer-group"});
    await consumer.connect();

    await consumer.subscribe({topics: ['users','orders']});
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
                    case "game-updated":
                        {
                            let jsonMessage = JSON.parse(message.value.toString());
                            db.updateMovie(jsonMessage['movieId'], jsonMessage['title'],jsonMessage['description'],jsonMessage['runtime'],jsonMessage['rating'],jsonMessage['is_showing'])
                            break;
                        }
                    case "game-deleted":
                        {
                            db.deleteMovie(message.value.toString())
                            break;
                        }
                }
                
            }
        }
        ) 
    } 

    main();