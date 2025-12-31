const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'fitpulse',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

async function migrate() {
    console.log('Running migration: Adding dietary_preferences to user_profiles');
    try {
        await pool.query(`
            ALTER TABLE user_profiles 
            ADD COLUMN IF NOT exists dietary_preferences TEXT;
        `);
        console.log('✅ Migration successful!');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
