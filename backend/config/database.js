const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing. Add it to backend/.env or Render Environment Variables.');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
});


pool.on('error', (error) => {
    console.error('Unexpected PostgreSQL pool error:', error);
});

pool.query('SELECT 1')
    .then(() => {
        console.log('Database connection successful');
    })
    .catch((error) => {
        console.error(`Database connection failed: ${error.message}`);
    });

module.exports = pool;
