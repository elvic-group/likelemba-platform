/**
 * Test Message Delivery with Detailed Error Handling
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const greenAPI = require('../src/config/greenapi');

async function testMessageDelivery() {
  try {
    console.log('📱 Testing Message Delivery...\n');

    const testPhone = process.env.TEST_PHONE || process.env.GREEN_PHONE || '4796701573';
    const message = '🧪 Test message - Please reply if you receive this!';

    console.log(`📤 Sending to: ${testPhone}`);
    console.log(`💬 Message: ${message}\n`);

    // Check instance state first
    try {
      const state = await greenAPI.instance.getStateInstance();
      if (state.stateInstance !== 'authorized') {
        console.error(`❌ Instance is not authorized. State: ${state.stateInstance}`);
        console.error('   Please authorize the instance in Green API console');
        process.exit(1);
      }
      console.log('✅ Instance is authorized\n');
    } catch (error) {
      console.error('❌ Error checking instance state:', error.message);
      process.exit(1);
    }

    // Format phone number
    const chatId = `${testPhone}@c.us`;
    console.log(`📞 Formatted chat ID: ${chatId}\n`);

    // Send message
    console.log('📨 Sending message...');
    const response = await greenAPI.message.sendMessage(chatId, null, message);

    console.log('\n✅ Message sent!');
    console.log(`📨 Message ID: ${response.idMessage || 'N/A'}`);
    console.log(`📊 Full response:`, JSON.stringify(response, null, 2));

    console.log('\n💡 Important Notes:');
    console.log('   - If you don\'t receive the message, check:');
    console.log('     1. Is your phone number correct? (should be: ' + testPhone + ')');
    console.log('     2. Is your WhatsApp online and connected?');
    console.log('     3. Have you sent a message to this number before?');
    console.log('     4. Check if the number is blocked');
    console.log('   - Messages may take a few seconds to deliver');
    console.log('   - Check your WhatsApp in a few moments');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error sending message:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code || 'N/A');
    console.error('   Status:', error.status || 'N/A');
    
    if (error.message.includes('notAuthorized')) {
      console.error('\n💡 Instance is not authorized');
      console.error('   Go to: https://console.green-api.com/');
      console.error('   Authorize your instance');
    } else if (error.message.includes('blocked')) {
      console.error('\n💡 Instance is blocked');
      console.error('   Contact Green API support');
    } else if (error.message.includes('phone')) {
      console.error('\n💡 Phone number issue');
      console.error('   Check if the phone number is correct');
      console.error('   Format should be: country code + number (no +, no spaces)');
    }
    
    process.exit(1);
  }
}

testMessageDelivery();

