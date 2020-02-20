exports.provider = {
    name: 'product',
    port: 3008,
};

exports.registry = {
    port: 3006
};

exports.mysql = {
    connectionLimit: 2,
    host: 'localhost',
    user: 'dev',
    password: '12345Qwert',
    database: 'sn_product'
};

exports.redis = {
    port: 6379,
    host: "127.0.0.1",
    retryStrategy: function (times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
};