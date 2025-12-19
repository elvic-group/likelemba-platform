/**
 * Test Webhook Response
 * Tests webhook endpoint and shows full response
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const http = require('http');

const WEBHOOK_URL = process.argv[2] || 'http://localhost:3000/webhooks/greenapi';

const testData = {
  typeWebhook: 'incomingMessageReceived',
  instanceData: {
    idInstance: 7700330457,
    wid: '7700330457@c.us',
    typeInstance: 'whatsapp'
  },
  timestamp: Date.now(),
  idMessage: 'test-' + Date.now(),
  senderData: {
    sender: '4796701573@c.us',
    senderName: 'Test User',
    senderChatId: '4796701573@c.us'
  },
  messageData: {
    typeMessage: 'textMessage',
    textMessageData: {
      textMessage: 'test message'
    }
  }
};

function testWebhook(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(testData);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'ngrok-skip-browser-warning': 'true'
      }
    };

    console.log('🧪 Testing Webhook Endpoint...\n');
    console.log(`📍 URL: ${url}`);
    console.log(`📦 Payload:`, JSON.stringify(testData, null, 2));
    console.log('\n📤 Sending request...\n');

    const protocol = urlObj.protocol === 'https:' ? require('https') : http;
    const req = protocol.request(options, (res) => {
      console.log('📊 Response Status:', res.statusCode, res.statusMessage);
      console.log('📋 Response Headers:', JSON.stringify(res.headers, null, 2));
      console.log('\n📥 Response Body:\n');

      let data = '';
      res.on('data', (chunk) => {
        data += chunk.toString();
      });

      res.on('end', () => {
        // Try to parse as JSON, otherwise show raw
        try {
          const json = JSON.parse(data);
          console.log(JSON.stringify(json, null, 2));
        } catch {
          console.log(data);
        }

        console.log('\n' + '='.repeat(50));
        if (res.statusCode === 200) {
          console.log('✅ SUCCESS: Webhook endpoint responded with 200 OK');
          console.log('💡 Check server logs to see if webhook was processed');
        } else if (res.statusCode === 404) {
          console.log('❌ ERROR: Endpoint not found (404)');
          console.log('💡 Possible issues:');
          console.log('   - Route not registered in server');
          console.log('   - Server needs to be restarted');
          console.log('   - Wrong URL path');
        } else {
          console.log(`⚠️  Status Code: ${res.statusCode}`);
        }

        resolve({ statusCode: res.statusCode, body: data });
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request Error:', error.message);
      console.error('\n💡 Possible issues:');
      if (error.code === 'ECONNREFUSED') {
        console.error('   - Server is not running');
        console.error('   - Wrong port number');
      } else if (error.code === 'ENOTFOUND') {
        console.error('   - Hostname not found');
        console.error('   - ngrok tunnel might be offline');
      } else {
        console.error('   - Network error:', error.code);
      }
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Run test
(async () => {
  try {
    await testWebhook(WEBHOOK_URL);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
})();

