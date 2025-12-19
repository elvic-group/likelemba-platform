/**
 * Add Contact Tracking Migration
 * Adds has_contacted_us and first_contact_at fields to users table
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { query } = require('../src/config/database');

async function addContactTracking() {
  try {
    console.log('🔄 Adding contact tracking fields...\n');

    // Add columns
    await query(`
      ALTER TABLE likelemba.users 
      ADD COLUMN IF NOT EXISTS has_contacted_us BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS first_contact_at TIMESTAMP
    `);

    console.log('✅ Added has_contacted_us and first_contact_at columns');

    // Create index
    await query(`
      CREATE INDEX IF NOT EXISTS idx_users_has_contacted 
      ON likelemba.users(has_contacted_us)
    `);

    console.log('✅ Created index on has_contacted_us');

    // Update existing users who have last_seen_at (they've contacted us)
    const result = await query(`
      UPDATE likelemba.users 
      SET has_contacted_us = TRUE, 
          first_contact_at = COALESCE(first_contact_at, last_seen_at)
      WHERE last_seen_at IS NOT NULL
      RETURNING id
    `);

    console.log(`✅ Updated ${result.rows.length} existing users who have contacted us`);

    console.log('\n✅ Contact tracking migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

addContactTracking();

