/**
 * Get Webhook URL from ngrok
 * Fetches the public URL from ngrok API
 */
const http = require('http');

async function getWebhookUrl() {
  try {
    return new Promise((resolve, reject) => {
      http.get('http://localhost:4040/api/tunnels', (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            const tunnels = response.tunnels || [];
            
            // Find HTTPS tunnel
            const httpsTunnel = tunnels.find(t => t.proto === 'https');
            
            if (httpsTunnel) {
              resolve(httpsTunnel.public_url);
            } else {
              // Fallback to HTTP if HTTPS not available
              const httpTunnel = tunnels.find(t => t.proto === 'http');
              if (httpTunnel) {
                resolve(httpTunnel.public_url);
              } else {
                reject(new Error('No ngrok tunnel found. Make sure ngrok is running.'));
              }
            }
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', (error) => {
        reject(new Error('Could not connect to ngrok API. Make sure ngrok is running.'));
      });
    });
  } catch (error) {
    throw error;
  }
}

async function displayWebhookUrls() {
  try {
    console.log('🔍 Fetching ngrok webhook URLs...\n');
    
    const baseUrl = await getWebhookUrl();
    
    if (!baseUrl) {
      throw new Error('No ngrok tunnel found');
    }
    
    console.log('✅ ngrok tunnel is active!\n');
    console.log('📋 Your Webhook URLs:\n');
    console.log(`   🌐 Base URL: ${baseUrl}\n`);
    console.log('   📱 Green API Webhook:');
    console.log(`      ${baseUrl}/webhooks/greenapi\n`);
    console.log('   💳 Stripe Webhook:');
    console.log(`      ${baseUrl}/webhooks/stripe\n`);
    console.log('   📱 Mobile Money Webhook:');
    console.log(`      ${baseUrl}/webhooks/mobilemoney\n`);
    console.log('📝 Next Steps:');
    console.log('   1. Copy the Green API webhook URL above');
    console.log('   2. Go to: https://console.green-api.com/');
    console.log('   3. Select instance: 7700330457');
    console.log('   4. Settings → Webhook Settings');
    console.log('   5. Paste the webhook URL');
    console.log('   6. Enable: incomingMessageReceived, outgoingMessageStatus, deviceStatus');
    console.log('   7. Save');
    console.log('');
    console.log('💡 Keep ngrok running while testing!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('');
    console.error('💡 Make sure:');
    console.error('   1. ngrok is running: npm run webhook:tunnel');
    console.error('   2. Or start manually: ngrok http 3000');
    console.error('   3. Server is running: npm start');
    console.error('');
    console.error('📋 To start ngrok:');
    console.error('   npm run webhook:tunnel');
    console.error('   or');
    console.error('   ngrok http 3000');
    process.exit(1);
  }
}

displayWebhookUrls();

