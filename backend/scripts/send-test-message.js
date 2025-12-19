/**
 * Send Test WhatsApp Message
 * Sends a test message via Green API to verify integration
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const greenAPI = require('../src/config/greenapi');

async function sendTestMessage() {
  try {
    console.log('📱 Sending test WhatsApp message...\n');

    const testPhone = process.env.TEST_PHONE || process.env.GREEN_PHONE || '4796701573';
    const message = '🧪 Test message from Likelemba platform\n\nIf you receive this, the platform is working correctly! ✅';

    console.log(`📤 Sending to: ${testPhone}`);
    console.log(`💬 Message: ${message.substring(0, 50)}...\n`);

    const chatId = `${testPhone}@c.us`;
    const response = await greenAPI.message.sendMessage(chatId, null, message);

    if (response.idMessage) {
      console.log('✅ Message sent successfully!');
      console.log(`📨 Message ID: ${response.idMessage}`);
      console.log(`\n💡 Check your WhatsApp to see the message`);
    } else {
      console.log('⚠️  Message sent but no ID returned');
      console.log('Response:', response);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error sending message:', error.message);
    
    if (error.message.includes('notAuthorized')) {
      console.error('\n💡 Green API instance is not authorized.');
      console.error('   Solution: Go to Green API console and authorize the instance');
    } else if (error.message.includes('not configured')) {
      console.error('\n💡 Green API is not configured.');
      console.error('   Solution: Set GREEN_ID_INSTANCE and GREEN_API_TOKEN_INSTANCE in .env');
    }
    
    process.exit(1);
  }
}

sendTestMessage();

