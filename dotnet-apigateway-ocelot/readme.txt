
!!! EUREKA AS A DOCKER CONTAINER DOESN'T LIKE UNDERSCORES _ IN THE HOSTNAME - BIG TROUBLE major headache !!!
docker run --name SEN300EurekaRegistry -d --net netSEN300 -p 8761:8761 -d steeltoeoss/eureka-server:latest

!!! this is weird, but sometimes when testing between different ocelot.json files, it seems like an old one gets "stuck", it's like it's not picking up the new one. I don't know how this is possible between runs of the program, but dotnet clean seems to clear it up

!!! below is the old-school way that you have in other .net projects, but just use ServiceUrl on its own now - major headache !!!
"ServiceUrl": {
        "DefaultZone": "http://SEN300EurekaRegistry:8761/eureka/"        
},

"ServiceUrl":"http://SEN300EurekaRegistry:8761/eureka/", 