const { createProvider } = require('sonorpc');
const MySQL = require('sonorpc-mysql');
const Redis = require('ioredis');

const config = require('../config');

const ctx = {
    mysql: new MySQL(config.mysql),
    redis: new Redis(config.redis)
};

module.exports = function start() {
    const rpcProvider = createProvider({
        name: 'product',
        ctx,
        port: 3008,
        registry: {
            port: 3006
        },
        services: [
            require('./CategoryService'),
            require('./BrandService'),
            require('./ProductService'),
            require('./FormulaService'),
            require('./SearchService'),
        ]
    });
    rpcProvider.start();
};