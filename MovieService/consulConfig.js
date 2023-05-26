const Consul = require('consul');
const { v4: uuidv4 } = require('uuid');

const consul = new Consul({ host: 'consul', promisify: true });
// const consul = new Consul({ host: 'localhost', promisify: true });


let serviceDefinition = {
  id: uuidv4(),
  name: 'movie-service',
  tags: ['movie', 'service'],
  address: 'movieserviceclientapi',
  port: 3000,
  check: {
    http: `http://movieserviceclientapi:${process.env.PORT || 3000}/health`,
    interval: '10s',
    timeout: '5s',
    deregistercriticalserviceafter: '1m'
  }
};

const registerWithConsul = () => {
  consul.agent.service.register(serviceDefinition)
    .then(() => {
      console.log('registered with Consul');
    })
    .catch((err) => {
      console.log('failed to register with Consul', err);
    });
};

module.exports = registerWithConsul;
