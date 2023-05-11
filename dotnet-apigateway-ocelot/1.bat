CLS

docker stop SEN300APIGatewayOcelot
docker rm SEN300APIGatewayOcelot
docker rmi sen300ocelotgatewayapi:1
docker build --no-cache -t sen300ocelotgatewayapi:1 .
docker run -d -p 5041:80 --name SEN300APIGatewayOcelot --net netSEN300 sen300ocelotgatewayapi:1