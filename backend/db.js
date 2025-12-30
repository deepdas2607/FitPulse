const { Pool } = require('pg');
require('dotenv').config();

const poolConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'fitpulse',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
};

console.log('DB Config:', {
    ...poolConfig,
    password: poolConfig.password ? poolConfig.password.substring(0, 2) + '***' : 'undefined'
});

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
