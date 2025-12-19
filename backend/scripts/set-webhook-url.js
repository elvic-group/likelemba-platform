/**
 * Set Webhook URL in Green API
 * Configures the webhook URL via Green API settings
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const greenAPI = require('../src/config/greenapi');
const http = require('http');

async function getNgrokUrl() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:4040/api/tunnels', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          const httpsTunnel = response.tunnels?.find(t => t.proto === 'https');
          if (httpsTunnel) {
            resolve(httpsTunnel.public_url);
          } else {
            reject(new Error('No ngrok HTTPS tunnel found'));
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', () => reject(new Error('ngrok not running')));
  });
}

async function setWebhookUrl() {
  try {
    console.log('🔧 Setting Webhook URL in Green API...\n');

    // Get ngrok URL
    let webhookUrl;
    try {
      const baseUrl = await getNgrokUrl();
      webhookUrl = `${baseUrl}/webhooks/greenapi`;
      console.log(`✅ Found ngrok URL: ${baseUrl}`);
    } catch (error) {
      console.error('❌ ngrok not running:', error.message);
      console.error('\n💡 Start ngrok first:');
      console.error('   npm run webhook:tunnel');
      console.error('   or');
      console.error('   ngrok http 3000');
      process.exit(1);
    }

    console.log(`📋 Webhook URL: ${webhookUrl}\n`);

    // Set webhook URL in Green API
    try {
      const response = await greenAPI.settings.setSettings({
        incomingWebhook: 'yes',
        incomingWebhookUrl: webhookUrl,
        outgoingWebhook: 'yes',
        stateWebhook: 'yes'
      });

      console.log('✅ Webhook URL configured successfully!');
      console.log('\n📊 Settings:');
      console.log(`   Incoming Webhook: ${response.incomingWebhook || 'yes'}`);
      console.log(`   Webhook URL: ${response.incomingWebhookUrl || webhookUrl}`);
      console.log(`   Outgoing Webhook: ${response.outgoingWebhook || 'yes'}`);
      console.log(`   State Webhook: ${response.stateWebhook || 'yes'}`);

      console.log('\n💡 Next steps:');
      console.log('   1. Send a test message to your WhatsApp number');
      console.log('   2. Check server logs for webhook receipt');
      console.log('   3. The 68 queued webhooks should start processing');

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
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setWebhookUrl();



