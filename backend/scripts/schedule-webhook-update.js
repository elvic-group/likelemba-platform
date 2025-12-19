/**
 * Schedule Webhook Update
 * 
 * Runs the webhook update script on a schedule
 * Useful for keeping webhook URL in sync automatically
 * 
 * Usage:
 *   node scripts/schedule-webhook-update.js
 * 
 * Or add to your app.js:
 *   require('./scripts/schedule-webhook-update');
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const cron = require('node-cron');

// Schedule options
const SCHEDULE = process.env.WEBHOOK_UPDATE_SCHEDULE || '0 * * * *'; // Every hour
const ENABLED = process.env.WEBHOOK_AUTO_UPDATE === 'true';

if (!ENABLED) {
  console.log('ℹ️  Webhook auto-update is disabled');
  console.log('   Set WEBHOOK_AUTO_UPDATE=true in .env to enable');
  process.exit(0);
}

console.log('🔄 Webhook Auto-Update Scheduler');
console.log(`   Schedule: ${SCHEDULE}`);
console.log('   Status: Enabled\n');

// Function to run webhook update
async function runWebhookUpdate() {
  try {
    console.log(`[${new Date().toISOString()}] 🔄 Running scheduled webhook update...`);
    
    // Import and run the update script
    const { spawn } = require('child_process');
    const scriptPath = require('path').resolve(__dirname, 'update-green-api-webhook.js');
    
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      cwd: __dirname
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`[${new Date().toISOString()}] ✅ Webhook update completed successfully\n`);
      } else {
        console.error(`[${new Date().toISOString()}] ❌ Webhook update failed with code ${code}\n`);
      }
    });
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Error running webhook update:`, error.message);
  }
}

// Run immediately on start (optional)
if (process.env.WEBHOOK_UPDATE_ON_START === 'true') {
  console.log('🚀 Running initial webhook update...\n');
  runWebhookUpdate();
}

// Schedule periodic updates
const job = cron.schedule(SCHEDULE, () => {
  runWebhookUpdate();
}, {
  scheduled: true,
  timezone: 'UTC'
});

console.log('✅ Webhook auto-update scheduler started');
console.log('   Press Ctrl+C to stop\n');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping webhook auto-update scheduler...');
  job.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Stopping webhook auto-update scheduler...');
  job.stop();
  process.exit(0);
});

// Keep process alive
if (require.main === module) {
  // If run directly, keep the process alive
  setInterval(() => {}, 1000);
}

module.exports = { runWebhookUpdate, job };

