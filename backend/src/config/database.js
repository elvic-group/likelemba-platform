/**
 * Database Configuration
 * PostgreSQL connection pool for Likelemba platform
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // Set search path to likelemba schema
  options: '-c search_path=likelemba,public',
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Database connected');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Query helper
const query = async (text, params) => {
  const start = Date.now();
  try {
    // Ensure we're using likelemba schema
    const client = await pool.connect();
    try {
      await client.query('SET search_path TO likelemba, public');
      const res = await client.query(text, params);
      const duration = Date.now() - start;
      if (duration > 1000) {
        console.log('⚠️ Slow query:', { text, duration });
      }
      return res;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database query error:', { text, error: error.message });
    throw error;
  }
};

// Transaction helper
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('SET search_path TO likelemba, public');
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  query,
  transaction,
};

