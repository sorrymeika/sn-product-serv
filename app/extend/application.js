const { registerConsumer } = require('sonorpc');

module.exports = {
    stockRPC: registerConsumer({
        providerName: 'stock',
        registry: {
            port: 3006
        }
    })
};