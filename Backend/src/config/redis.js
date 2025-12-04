const logger = require('./logger');

const redis = require('redis');
const client = redis.createClient({
});

client.on('error', (err) => console.log('Redis Client Error', err));

(async () => {
    await client.connect();
    logger.info('Redis conectado com sucesso!');
})();

module.exports = client;