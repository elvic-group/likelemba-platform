/**
 * Check Green API Instance State
 * Verifies if the instance is authorized and can send messages
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const greenAPI = require('../src/config/greenapi');

async function checkGreenAPIState() {
  try {
    console.log('🔍 Checking Green API Instance State...\n');

    // Check if credentials are set
    if (!process.env.GREEN_ID_INSTANCE || !process.env.GREEN_API_TOKEN_INSTANCE) {
      console.error('❌ Green API credentials not set in .env file');
      console.error('   Set GREEN_ID_INSTANCE and GREEN_API_TOKEN_INSTANCE');
      process.exit(1);
    }

    console.log(`📱 Instance ID: ${process.env.GREEN_ID_INSTANCE}`);
    console.log(`🔑 Token: ${process.env.GREEN_API_TOKEN_INSTANCE.substring(0, 10)}...\n`);

    // Check instance state
    try {
      const state = await greenAPI.instance.getStateInstance();
      console.log(`📊 Instance State: ${state.stateInstance || 'unknown'}`);
      
      if (state.stateInstance === 'authorized') {
        console.log('✅ Instance is AUTHORIZED and ready to send messages');
      } else if (state.stateInstance === 'notAuthorized') {
        console.log('❌ Instance is NOT AUTHORIZED');
        console.log('\n💡 To authorize:');
        console.log('   1. Go to: https://console.green-api.com/');
        console.log(`   2. Select instance: ${process.env.GREEN_ID_INSTANCE}`);
        console.log('   3. Click "Authorize" or scan QR code');
      } else if (state.stateInstance === 'blocked') {
        console.log('❌ Instance is BLOCKED');
        console.log('   Contact Green API support');
      } else {
        console.log(`⚠️  Instance state: ${state.stateInstance}`);
      }
    } catch (error) {
      console.error('❌ Error checking instance state:', error.message);
      console.error('\n💡 Possible issues:');
      console.error('   - Instance ID or token is incorrect');
      console.error('   - Instance does not exist');
      console.error('   - Network connection issue');
      console.error('   - Instance not authorized');
    }

    // Try to get settings
    try {
      const settings = await greenAPI.settings.getSettings();
      console.log('\n📋 Instance Settings:');
      console.log(`   Incoming Webhook: ${settings.incomingWebhook || 'not set'}`);
      console.log(`   Webhook URL: ${settings.incomingWebhookUrl || 'not set'}`);
    } catch (error) {
      console.log('\n⚠️  Could not retrieve settings:', error.message);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkGreenAPIState();

