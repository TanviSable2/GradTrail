const { Pool } = require('pg');
require('dotenv').config();

// Supports two modes:
// 1. DATABASE_URL (single connection string) — used by Neon/Railway in production
// 2. Individual DB_HOST/DB_PORT/etc vars — used for local development
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // required for Neon's managed SSL
    })
  : new Pool({
      host:     process.env.DB_HOST     || 'localhost',
      port:     Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME     || 'nextstep_db',
      user:     process.env.DB_USER     || 'postgres',
      password: String(process.env.DB_PASSWORD || 'postgres'),
    });

pool.on('error', (err) => {
  console.error('Unexpected DB error:', err.message);
});

module.exports = pool;