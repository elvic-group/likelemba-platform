/**
 * Database Migration Script
 * Runs schema.sql to set up database
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const fs = require('fs');
const { pool } = require('../src/config/database');
const path = require('path');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🔄 Running database migrations...');

    // Check if tables already exist
    const tablesCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    `);

    if (tablesCheck.rows.length > 0) {
      console.log('⚠️  Tables already exist. Checking schema...');
      
      // Check if users table has correct structure
      const columnsCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'phone_e164'
      `);

      if (columnsCheck.rows.length === 0) {
        console.log('⚠️  Existing tables have different structure.');
        console.log('💡 Consider dropping existing tables or using a fresh database.');
        console.log('   To drop all tables: DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        process.exit(1);
      } else {
        console.log('✅ Database schema already exists and is correct.');
        process.exit(0);
      }
    }

    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    await client.query(schema);

    console.log('✅ Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    // More detailed error info
    if (error.code === '42703') {
      console.error('💡 This usually means tables exist with different structure.');
      console.error('   Solution: Use a fresh database or drop existing tables.');
    }
    
    process.exit(1);
  } finally {
    client.release();
  }
}

migrate();
