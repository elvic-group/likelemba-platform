/**
 * Send Message with Phone Number Verification
 * Checks phone format and sends test message
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const greenAPI = require('../src/config/greenapi');

async function sendWithPhoneCheck() {
  try {
    console.log('📱 Sending Test Message with Phone Verification...\n');

    // Get phone from environment or use default
    let testPhone = process.env.TEST_PHONE || process.env.GREEN_PHONE || '4796701573';
    
    // Remove any formatting
    testPhone = testPhone.replace(/[\s\+\-\(\)]/g, '');
    
    console.log(`📞 Phone number: ${testPhone}`);
    console.log(`📞 Formatted for WhatsApp: ${testPhone}@c.us\n`);

    // Check if phone looks like Norwegian number
    if (testPhone.startsWith('47')) {
      console.log('✅ Detected Norwegian number (+47)');
      console.log(`   Full number: +${testPhone}`);
      console.log(`   Without country code: ${testPhone.substring(2)}\n`);
    }

    const message = '🧪 Test from Likelemba\n\nIf you receive this, please reply "YES"';

    // Check instance state
    const state = await greenAPI.instance.getStateInstance();
    if (state.stateInstance !== 'authorized') {
      console.error(`❌ Instance not authorized: ${state.stateInstance}`);
      process.exit(1);
    }

    console.log('✅ Instance authorized\n');
    console.log('📨 Sending message...\n');

    const chatId = `${testPhone}@c.us`;
    const response = await greenAPI.message.sendMessage(chatId, null, message);

    console.log('✅ Message sent successfully!');
    console.log(`📨 Message ID: ${response.idMessage}\n`);

    console.log('💡 Troubleshooting:');
    console.log('   1. Verify your phone number is correct');
    console.log('   2. Make sure your WhatsApp is online');
    console.log('   3. Try sending a message TO the business number first');
    console.log('   4. Check if you have blocked the number');
    console.log('   5. Wait a few seconds - delivery can be delayed\n');

    console.log('📱 Your phone number format:');
    console.log(`   Current: ${testPhone}`);
    console.log(`   Expected format: Country code + number (no +, no spaces)`);
    console.log(`   Example: 4796701573 (Norway: +47 96701573)\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

sendWithPhoneCheck();

