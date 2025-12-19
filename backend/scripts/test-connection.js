/**
 * Test Database and API Connections
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { query } = require('../src/config/database');
const greenAPI = require('../src/config/greenapi');
const stripe = require('../src/config/stripe');

async function testConnections() {
  console.log('🧪 Testing connections...\n');

  // Test database
  try {
    await query('SELECT 1');
    console.log('✅ Database: Connected');
  } catch (error) {
    console.error('❌ Database: Failed -', error.message);
  }

  // Test Green API
  try {
    const state = await greenAPI.account.getStateInstance();
    console.log(`✅ Green API: ${state.stateInstance || 'Connected'}`);
  } catch (error) {
    console.error('❌ Green API: Failed -', error.message);
  }

  // Test Stripe
  try {
    // Just check if client is configured
    if (process.env.STRIPE_SECRET_KEY) {
      console.log('✅ Stripe: Configured');
    } else {
      console.log('⚠️ Stripe: Not configured');
    }
  } catch (error) {
    console.error('❌ Stripe: Failed -', error.message);
  }

  console.log('\n✅ Connection tests completed!');
  process.exit(0);
}

testConnections();

