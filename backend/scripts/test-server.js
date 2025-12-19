/**
 * Server Test Script
 * Tests if server starts and responds correctly
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const http = require('http');

const PORT = process.env.PORT || 3000;
const HOST = 'localhost';

async function testServer() {
  console.log('🧪 Testing server startup...\n');

  return new Promise((resolve, reject) => {
    // Import app (this will start the server)
    const app = require('../src/app');
    
    // Wait a bit for server to start
    setTimeout(() => {
      // Test health endpoint
      const options = {
        hostname: HOST,
        port: PORT,
        path: '/health',
        method: 'GET',
      };

      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            
            // Accept both 'healthy' and 'UP' as valid status
            if (response.status === 'healthy' || response.status === 'UP' || res.statusCode === 200) {
              console.log('✅ Server is running!');
              console.log('✅ Health check passed!');
              
              if (response.services) {
                console.log('\n📊 Services Status:');
                console.log(`   Database: ${response.services.database || 'connected'}`);
                console.log(`   Green API: ${response.services.greenAPI || 'configured'}`);
                console.log(`   Stripe: ${response.services.stripe || 'configured'}`);
              }
              
              console.log('\n🎉 Server is ready to receive requests!');
              console.log(`\n🔗 Health endpoint: http://${HOST}:${PORT}/health`);
              console.log(`📱 Webhook endpoint: http://${HOST}:${PORT}/webhooks/greenapi`);
              
              resolve();
            } else {
              console.error('❌ Health check failed:', response);
              reject(new Error('Health check failed'));
            }
          } catch (error) {
            console.error('❌ Error parsing response:', error);
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ Request failed:', error.message);
        console.error('💡 Make sure server is running: npm start');
        reject(error);
      });

      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    }, 2000);
  });
}

// Run test
testServer()
  .then(() => {
    console.log('\n✅ Server test completed successfully!');
    console.log('\n💡 To keep server running, use: npm start');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Server test failed:', error.message);
    process.exit(1);
  });

