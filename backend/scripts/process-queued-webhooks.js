/**
 * Process Queued Webhooks
 * Starts ngrok tunnel and configures webhook URL to process queued webhooks
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { startNgrokTunnel } = require('./start-ngrok-tunnel');
const greenAPI = require('../src/config/greenapi');

async function processQueuedWebhooks() {
  try {
    console.log('🔄 Processing Queued Webhooks\n');
    console.log('='.repeat(50) + '\n');

    // Step 1: Start ngrok tunnel
    console.log('📡 Step 1: Starting ngrok tunnel...\n');
    const webhookUrls = await startNgrokTunnel();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Tunnel Active!\n');
    console.log(`🌐 Base URL: ${webhookUrls.baseUrl}`);
    console.log(`📱 Webhook URL: ${webhookUrls.greenApiWebhook}\n`);

    // Step 2: Configure in Green API
    console.log('🔧 Step 2: Configuring webhook in Green API...\n');
    try {
      const response = await greenAPI.settings.setSettings({
        incomingWebhook: 'yes',
        incomingWebhookUrl: webhookUrls.greenApiWebhook,
        outgoingWebhook: 'yes',
        stateWebhook: 'yes'
      });

      console.log('✅ Webhook configured successfully!\n');
      console.log('📊 Settings:');
      console.log(`   Incoming Webhook: ${response.incomingWebhook || 'yes'}`);
      console.log(`   Webhook URL: ${response.incomingWebhookUrl || webhookUrls.greenApiWebhook}`);
      console.log(`   Outgoing Webhook: ${response.outgoingWebhook || 'yes'}`);
      console.log(`   State Webhook: ${response.stateWebhook || 'yes'}`);
      
    } catch (error) {
      console.error('⚠️  Auto-configuration failed:', error.message);
      console.error('\n💡 Please configure manually:');
      console.error(`   1. Go to: https://console.green-api.com/`);
      console.error(`   2. Instance: ${process.env.GREEN_ID_INSTANCE || '7700330457'}`);
      console.error(`   3. Settings → Webhook Settings`);
      console.error(`   4. Paste: ${webhookUrls.greenApiWebhook}`);
      console.error(`   5. Enable: incomingMessageReceived, outgoingMessageStatus, deviceStatus`);
      console.error(`   6. Save`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('\n📬 Queued Webhooks:');
    console.log('   Green API will automatically retry the 5 queued webhooks');
    console.log('   They should be delivered within a few seconds');
    console.log('\n💡 Keep this script running to maintain the tunnel');
    console.log('💡 Check your server logs to see incoming webhooks');
    console.log('💡 Press Ctrl+C to stop\n');

    // Keep process alive
    return webhookUrls;

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  processQueuedWebhooks().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { processQueuedWebhooks };

