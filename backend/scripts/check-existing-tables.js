/**
 * Check Existing Database Tables
 * Shows what tables exist and their structure
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { query } = require('../src/config/database');

async function checkTables() {
  try {
    console.log('🔍 Checking existing database tables...\n');

    // Get all tables
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log(`📊 Found ${tablesResult.rows.length} tables:\n`);
    
    for (const row of tablesResult.rows) {
      const tableName = row.table_name;
      
      // Get columns for each table
      const columnsResult = await query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

      console.log(`📋 Table: ${tableName}`);
      console.log(`   Columns (${columnsResult.rows.length}):`);
      columnsResult.rows.forEach(col => {
        console.log(`     - ${col.column_name} (${col.data_type})`);
      });
      console.log('');
    }

    // Check for Likelemba-specific tables
    const likelembaTables = ['users', 'groups', 'cycles', 'payments', 'escrow_accounts', 'ledger_events'];
    const existingLikelemba = tablesResult.rows
      .map(r => r.table_name)
      .filter(t => likelembaTables.includes(t));

    if (existingLikelemba.length > 0) {
      console.log('⚠️  Found existing Likelemba tables:');
      existingLikelemba.forEach(t => console.log(`   - ${t}`));
      console.log('\n💡 These may conflict with new schema.');
      console.log('   Options:');
      console.log('   1. Use a different database');
      console.log('   2. Drop existing tables: node scripts/reset-database.js');
      console.log('   3. Rename existing tables and create new ones');
    } else {
      console.log('✅ No existing Likelemba tables found. Safe to migrate.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking tables:', error);
    process.exit(1);
  }
}

checkTables();

