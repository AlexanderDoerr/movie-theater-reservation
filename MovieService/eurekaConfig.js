const Eureka = require('eureka-js-client').Eureka;
const ip = require('ip');
const uuid = require('uuid');

const uniqueId = uuid.v4();
const ipAddress = ip.address();
const instanceId = `MovieServiceClientAPI:${uniqueId}:${process.env.PORT || 3000}`;

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
        // host: 'localhost',
        host: 'EurekaServer',
        port: 8761,
        servicePath: '/eureka/apps/',
    },
});

module.exports = eurekaClient;