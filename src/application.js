const { createProvider, registerConsumer } = require('sonorpc');
const MySQL = require('sonorpc-mysql');
const Redis = require('ioredis');

const config = require('./config');

const application = {
    mysql: new MySQL(config.mysql),
    redis: new Redis(config.redis),
    stockRPC: registerConsumer({
        providerName: 'stock',
        registry: {
            port: 3006
        }
    })
};

exports.start = function start() {
    const rpcProvider = createProvider({
        name: 'product',
        port: 3008,
        registry: {
            port: 3006
        },
        extentions: {
            application
        },
        services: [
            require('./services/FdCategoryService'),
            require('./services/CategoryService'),
            require('./services/BrandService'),
            require('./services/ProductService'),
            require('./services/FormulaService'),
            require('./services/SearchService'),
        ]
    });
    rpcProvider.start();
};