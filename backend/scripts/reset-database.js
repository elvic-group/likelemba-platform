/**
 * Database Reset Script
 * Drops all tables and recreates schema (USE WITH CAUTION)
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { pool } = require('../src/config/database');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function resetDatabase() {
  try {
    console.log('⚠️  WARNING: This will DELETE ALL DATA in the database!');
    const answer = await question('Are you sure you want to continue? (yes/no): ');

    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ Database reset cancelled.');
      rl.close();
      process.exit(0);
    }

    const client = await pool.connect();

    try {
      console.log('🗑️  Dropping all tables...');
      await client.query('DROP SCHEMA public CASCADE;');
      await client.query('CREATE SCHEMA public;');
      await client.query('GRANT ALL ON SCHEMA public TO postgres;');
      await client.query('GRANT ALL ON SCHEMA public TO public;');

      console.log('📋 Creating new schema...');
      const schemaPath = path.join(__dirname, '../database/schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schema);

      console.log('✅ Database reset completed successfully!');
    } finally {
      client.release();
    }

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    rl.close();
    process.exit(1);
  }
}

resetDatabase();

