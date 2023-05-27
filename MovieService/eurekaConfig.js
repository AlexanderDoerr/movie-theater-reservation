const Eureka = require('eureka-js-client').Eureka;
const ip = require('ip');
const uuid = require('uuid'); // Add this line to import the 'uuid' package

const uniqueId = uuid.v4(); // Generate a unique UUID

const instanceId = `MovieServiceClientAPI:${uniqueId}:${process.env.PORT || 3000}`; // Update the instanceId variable to include the unique UUID

const ipAddress = ip.address();

const eurekaClient = new Eureka({
  instance: {
    app: 'MovieServiceClientAPI',
    instanceId: instanceId,
    hostName: 'MovieServiceClientAPI',
    ipAddr: ipAddress,
    statusPageUrl: `http://${ipAddress}:${process.env.PORT || 3000}`,
    port: {
      '$': process.env.PORT || 3000,
      '@enabled': 'true',
    },
    vipAddress: 'MovieServiceClientAPI',
    dataCenterInfo: {
      '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
      name: 'MyOwn',
    },
  },
  eureka: {
    host: 'EurekaServer',
    port: 8761,
    servicePath: '/eureka/apps/',
  },
});

module.exports = eurekaClient;

