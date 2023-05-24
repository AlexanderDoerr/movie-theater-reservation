const kafka = require("./streams/kafka.js");
const email = require("./email.js");

main  = async () =>
{
    consumer = kafka.consumer({groupId: "email-consumer-group"});
    await consumer.connect();

    await consumer.subscribe({topics: ['users','orders']});
    await consumer.run(
        {
            eachMessage: async({topic, patition, message, heartbeat, pause}) =>
            {
                let key = message.key.toString();
                let jsonMessage = message.value.toString();
                switch(key)
                {
                    case "user-created":
                        {
                            email(jsonMessage, "Account Created", "Your account was created")
                            break;
                        }
                    case "order-created":
                        {
                            email(jsonMessage, "Order Placed", "Your order was placed")
                            break
                        }
                }
                
            }
        }
        ) 
    } 

    main();