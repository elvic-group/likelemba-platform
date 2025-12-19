/**
 * Set Green API Webhook URL
 * Configures the webhook URL in Green API to point to Heroku production
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const greenAPI = require('../src/config/greenapi');

async function setWebhookUrl() {
  try {
    console.log('🔧 Setting Green API Webhook URL...\n');

    // Production webhook URL
    const webhookUrl = 'https://likelemba-production-8eb76f5c732e.herokuapp.com/webhooks/greenapi';
    
    console.log(`📋 Webhook URL: ${webhookUrl}\n`);

    // Set webhook URL in Green API
    try {
      // Try settings.setSettings first (if available)
      let response;
      if (greenAPI.settings && greenAPI.settings.setSettings) {
        response = await greenAPI.settings.setSettings({
          incomingWebhook: 'yes',
          incomingWebhookUrl: webhookUrl,
          outgoingWebhook: 'yes',
          stateWebhook: 'yes',
          delaySendMessagesMilliseconds: 12000
        });
      } else if (greenAPI.account && greenAPI.account.setSettings) {
        response = await greenAPI.account.setSettings({
          incomingWebhook: 'yes',
          incomingWebhookUrl: webhookUrl,
          outgoingWebhook: 'yes',
          stateWebhook: 'yes',
          delaySendMessagesMilliseconds: 12000
        });
      } else {
        throw new Error('setSettings method not found. Please configure webhook manually in Green API console.');
      }

      console.log('✅ Webhook URL configured successfully!');
      console.log('\n📊 Settings:');
      console.log(`   Incoming Webhook: ${response.incomingWebhook || 'yes'}`);
      console.log(`   Webhook URL: ${response.incomingWebhookUrl || webhookUrl}`);
      console.log(`   Outgoing Webhook: ${response.outgoingWebhook || 'yes'}`);
      console.log(`   State Webhook: ${response.stateWebhook || 'yes'}`);

      console.log('\n💡 Next steps:');
      console.log('   1. Send a test message to your WhatsApp number');
      console.log('   2. Check Heroku logs: heroku logs --tail --app likelemba-production');
      console.log('   3. Verify messages are being received and processed');

    } catch (error) {
      console.error('❌ Error setting webhook URL:', error.message);
      if (error.response) {
        console.error('Response:', JSON.stringify(error.response.data, null, 2));
      }
      console.error('\n💡 You can also set it manually:');
      console.error('   1. Go to: https://console.green-api.com/');
      console.error('   2. Select instance:', process.env.GREEN_ID_INSTANCE);
      console.error('   3. Settings → Webhook Settings');
      console.error(`   4. Paste: ${webhookUrl}`);
      console.error('   5. Enable: incomingMessageReceived, outgoingMessageStatus, deviceStatus');
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setWebhookUrl();

