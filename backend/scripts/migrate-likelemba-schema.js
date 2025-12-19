/**
 * Database Migration Script - Likelemba Schema
 * Creates Likelemba tables in separate schema to avoid conflicts
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const fs = require('fs');
const { pool } = require('../src/config/database');
const path = require('path');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🔄 Running Likelemba database migration (separate schema)...\n');

    const schemaPath = path.join(__dirname, '../database/schema-likelemba.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    await client.query(schema);

    // Set search path for this connection
    await client.query('SET search_path TO likelemba, public');

    // Verify tables created
    const tablesCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'likelemba'
      ORDER BY table_name
    `);

    console.log(`✅ Database migration completed successfully!`);
    console.log(`📊 Created ${tablesCheck.rows.length} tables in 'likelemba' schema:\n`);
    
    tablesCheck.rows.forEach((row, index) => {
      if (index < 10) {
        console.log(`   ${index + 1}. ${row.table_name}`);
      }
    });
    
    if (tablesCheck.rows.length > 10) {
      console.log(`   ... and ${tablesCheck.rows.length - 10} more`);
    }

    console.log('\n✅ Likelemba schema ready!');
    console.log('💡 Tables are in "likelemba" schema to avoid conflicts with existing tables.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    if (error.code === '42P07') {
      console.error('💡 Some tables may already exist. This is OK if you\'re re-running migration.');
    }
    
    process.exit(1);
  } finally {
    client.release();
  }
}

migrate();

