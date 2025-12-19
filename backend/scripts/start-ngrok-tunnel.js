/**
 * Start ngrok tunnel programmatically using ngrok SDK
 * Creates a tunnel and returns the webhook URL
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const ngrok = require('@ngrok/ngrok');
const fs = require('fs');
const path = require('path');
const os = require('os');

const WEBHOOK_URL_FILE = path.join(__dirname, '../WEBHOOK_URL.txt');
const PORT = process.env.PORT || 3000;

let listener = null;

// Read authtoken from ngrok config file
function getNgrokAuthtoken() {
  try {
    const yaml = require('yaml');
    const configPath = path.join(os.homedir(), 'Library/Application Support/ngrok/ngrok.yml');
    
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');
      const config = yaml.parse(configContent);
      // Authtoken can be at root level or under agent.authtoken
      return config.authtoken || config.agent?.authtoken || null;
    }
  } catch (error) {
    // Fallback: try to read from environment
    return process.env.NGROK_AUTHTOKEN || null;
  }
  return null;
}

async function startNgrokTunnel() {
  try {
    console.log('🚀 Starting ngrok tunnel programmatically...\n');

    // Check if server is running
    const http = require('http');
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${PORT}/health`, (res) => {
          resolve();
        });
        req.on('error', reject);
        req.setTimeout(2000, () => {
          req.destroy();
          reject(new Error('Server not responding'));
        });
      });
      console.log(`✅ Server detected on port ${PORT}\n`);
    } catch (error) {
      console.warn(`⚠️  Server might not be running on port ${PORT}`);
      console.warn('💡 Start your server first: npm start\n');
    }

    // Get authtoken from config file
    const authtoken = getNgrokAuthtoken();
    
    if (!authtoken) {
      throw new Error('ngrok authtoken not found. Run: ngrok config add-authtoken YOUR_TOKEN');
    }

    // Create ngrok listener with explicit authtoken
    listener = await ngrok.forward({
      addr: PORT,
      authtoken: authtoken,
    });

    const publicUrl = listener.url();
    
    console.log('✅ ngrok tunnel created successfully!\n');
    console.log('📋 Your Webhook URLs:\n');
    console.log(`   🌐 Base URL: ${publicUrl}\n`);
    console.log('   📱 Green API Webhook:');
    const greenApiWebhook = `${publicUrl}/webhooks/greenapi`;
    console.log(`      ${greenApiWebhook}\n`);
    console.log('   💳 Stripe Webhook:');
    console.log(`      ${publicUrl}/webhooks/stripe\n`);
    console.log('   📱 Mobile Money Webhook:');
    console.log(`      ${publicUrl}/webhooks/mobilemoney\n`);

    // Save webhook URL to file
    const webhookContent = `🌐 YOUR GREEN API WEBHOOK URL:

${greenApiWebhook}

📋 Copy this URL and paste it in Green API Console:
   https://console.green-api.com/
   
   Instance: ${process.env.GREEN_ID_INSTANCE || '7700330457'}
   Settings → Webhook Settings

💡 Keep this script running while testing!
`;

    fs.writeFileSync(WEBHOOK_URL_FILE, webhookContent);
    console.log(`📝 Webhook URL saved to: ${WEBHOOK_URL_FILE}\n`);

    console.log('📝 Next Steps:');
    console.log('   1. Copy the Green API webhook URL above');
    console.log('   2. Go to: https://console.green-api.com/');
    console.log(`   3. Select instance: ${process.env.GREEN_ID_INSTANCE || '7700330457'}`);
    console.log('   4. Settings → Webhook Settings');
    console.log('   5. Paste the webhook URL');
    console.log('   6. Enable: incomingMessageReceived, outgoingMessageStatus, deviceStatus');
    console.log('   7. Save');
    console.log('');
    console.log('💡 Keep this script running to maintain the tunnel!');
    console.log('💡 Press Ctrl+C to stop the tunnel\n');

    // Keep the process alive
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 Stopping ngrok tunnel...');
      if (listener) {
        await listener.close();
        console.log('✅ Tunnel closed');
      }
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      if (listener) {
        await listener.close();
      }
      process.exit(0);
    });

    // Return the URL for programmatic use
    return {
      baseUrl: publicUrl,
      greenApiWebhook: greenApiWebhook,
      stripeWebhook: `${publicUrl}/webhooks/stripe`,
      mobileMoneyWebhook: `${publicUrl}/webhooks/mobilemoney`
    };

  } catch (error) {
    console.error('❌ Error starting ngrok tunnel:', error.message);
    console.error('');
    
    if (error.message.includes('authtoken')) {
      console.error('💡 Make sure ngrok authtoken is configured:');
      console.error('   ngrok config add-authtoken YOUR_TOKEN');
    }
    
    if (error.message.includes('port') || error.message.includes('address')) {
      console.error(`💡 Port ${PORT} might be in use or server not running`);
    }
    
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  startNgrokTunnel().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { startNgrokTunnel };

