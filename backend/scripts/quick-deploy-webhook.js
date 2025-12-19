/**
 * Quick Deploy Webhook - Start ngrok tunnel and optionally configure Green API
 * This script starts ngrok programmatically and can auto-configure the webhook
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { startNgrokTunnel } = require('./start-ngrok-tunnel');
const greenAPI = require('../src/config/greenapi');

async function quickDeployWebhook(autoConfigure = false) {
  try {
    console.log('🚀 Quick Webhook Deployment\n');
    console.log('=' .repeat(50) + '\n');

    // Start ngrok tunnel
    const webhookUrls = await startNgrokTunnel();
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 Deployment Summary\n');
    console.log(`✅ Tunnel Status: ACTIVE`);
    console.log(`🌐 Base URL: ${webhookUrls.baseUrl}`);
    console.log(`📱 Green API Webhook: ${webhookUrls.greenApiWebhook}`);
    
    // Optionally configure in Green API
    if (autoConfigure) {
      console.log('\n🔧 Configuring webhook in Green API...\n');
      try {
        const response = await greenAPI.settings.setSettings({
          incomingWebhook: 'yes',
          incomingWebhookUrl: webhookUrls.greenApiWebhook,
          outgoingWebhook: 'yes',
          stateWebhook: 'yes'
        });

        console.log('✅ Webhook configured in Green API!');
        console.log('\n📊 Settings Applied:');
        console.log(`   Incoming Webhook: ${response.incomingWebhook || 'yes'}`);
        console.log(`   Webhook URL: ${response.incomingWebhookUrl || webhookUrls.greenApiWebhook}`);
        console.log(`   Outgoing Webhook: ${response.outgoingWebhook || 'yes'}`);
        console.log(`   State Webhook: ${response.stateWebhook || 'yes'}`);
      } catch (error) {
        console.error('⚠️  Could not auto-configure Green API:', error.message);
        console.error('\n💡 Configure manually:');
        console.error(`   1. Go to: https://console.green-api.com/`);
        console.error(`   2. Paste: ${webhookUrls.greenApiWebhook}`);
      }
    } else {
      console.log('\n💡 To auto-configure Green API, run:');
      console.log('   node scripts/quick-deploy-webhook.js --configure');
    }

    console.log('\n' + '='.repeat(50));
    console.log('\n✨ Webhook deployment complete!');
    console.log('💡 Keep this script running to maintain the tunnel\n');

    // Keep process alive
    return webhookUrls;

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  const autoConfigure = process.argv.includes('--configure') || process.argv.includes('-c');
  quickDeployWebhook(autoConfigure).catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { quickDeployWebhook };

