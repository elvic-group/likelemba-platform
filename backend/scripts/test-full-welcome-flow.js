/**
 * Test Full Welcome Flow
 * Simulates a new user sending "Hi" and receiving welcome message
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const whatsappHandler = require('../src/services/whatsapp/handler');
const usersService = require('../src/services/users');

async function testFullWelcomeFlow() {
  try {
    console.log('🧪 Testing Full Welcome Flow...\n');

    const testPhone = process.env.TEST_PHONE || process.env.GREEN_PHONE || '4796701573';
    const testName = 'Test User';

    console.log(`📱 Simulating new user: ${testPhone}`);
    console.log(`👤 Name: ${testName}\n`);

    // Simulate webhook data for incoming "Hi" message
    const webhookData = {
      typeWebhook: 'incomingMessageReceived',
      senderData: {
        sender: `${testPhone}@c.us`,
        senderName: testName,
        senderChatId: `${testPhone}@c.us`,
      },
      messageData: {
        typeMessage: 'textMessage',
        textMessageData: {
          textMessage: 'Hi',
        },
      },
    };

    console.log('📨 Processing incoming "Hi" message...\n');

    // Process the webhook (this will create user and send welcome message)
    await whatsappHandler.handleWebhook(webhookData);

    console.log('\n✅ Welcome flow completed!');
    console.log('\n📱 Check your WhatsApp to see:');
    console.log('   1. Welcome text message');
    console.log('   2. Language selection options');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing welcome flow:', error);
    process.exit(1);
  }
}

testFullWelcomeFlow();

