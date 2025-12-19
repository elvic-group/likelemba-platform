/**
 * Test Webhook Endpoint
 * Tests if the webhook endpoint is accessible and responding
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const http = require('http');

async function testWebhookEndpoint() {
  try {
    console.log('🧪 Testing Webhook Endpoint...\n');

    const testData = {
      typeWebhook: 'incomingMessageReceived',
      senderData: {
        sender: '4796701573@c.us',
        senderName: 'Test User',
        senderChatId: '4796701573@c.us'
      },
      messageData: {
        typeMessage: 'textMessage',
        textMessageData: {
          textMessage: 'test'
        }
      }
    };

    const postData = JSON.stringify(testData);

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/webhooks/greenapi',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('📤 Sending test webhook to: http://localhost:3000/webhooks/greenapi');
    console.log('📦 Data:', JSON.stringify(testData, null, 2));
    console.log('');

    const req = http.request(options, (res) => {
      console.log(`📊 Status Code: ${res.statusCode}`);
      console.log(`📋 Headers:`, res.headers);
      console.log('');

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('📥 Response Body:', data || '(empty)');
        console.log('');

        if (res.statusCode === 200) {
          console.log('✅ Webhook endpoint is working!');
          console.log('💡 Check server logs to see if webhook was processed');
        } else if (res.statusCode === 404) {
          console.log('❌ Webhook endpoint not found (404)');
          console.log('💡 Possible issues:');
          console.log('   - Server might not be running');
          console.log('   - Route not registered correctly');
          console.log('   - Server needs to be restarted');
        } else {
          console.log(`⚠️  Unexpected status code: ${res.statusCode}`);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      console.error('💡 Make sure the server is running on port 3000');
    });

    req.write(postData);
    req.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testWebhookEndpoint();
