/**
 * Stripe Configuration
 * Payment processing client setup
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const Stripe = require('stripe');

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('❌ Stripe secret key missing!');
  module.exports = {
    checkout: {
      sessions: {
        create: async () => {
          throw new Error('Stripe not configured');
        },
      },
    },
    refunds: {
      create: async () => {
        throw new Error('Stripe not configured');
      },
    },
    webhooks: {
      constructEvent: () => {
        throw new Error('Stripe not configured');
      },
    },
  };
} else {
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2024-12-18.acacia',
  });
  
  console.log('✅ Stripe client configured');
  module.exports = stripe;
}

