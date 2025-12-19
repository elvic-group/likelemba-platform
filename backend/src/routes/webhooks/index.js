/**
 * Webhook Routes
 * Handles incoming webhooks from Green API, Stripe, and Mobile Money providers
 */
const express = require('express');
const router = express.Router();
const whatsappHandler = require('../../services/whatsapp/handler');
const stripeWebhookHandler = require('../../services/payments/stripeWebhookHandler');
const mobileMoneyWebhookHandler = require('../../services/payments/mobileMoneyWebhookHandler');

// Green API webhook
router.post('/greenapi', async (req, res) => {
  try {
    console.log('📨 Green API webhook received:', req.body.typeWebhook);
    
    // Process webhook asynchronously
    whatsappHandler.handleWebhook(req.body).catch((error) => {
      console.error('Error processing Green API webhook:', error);
    });
    
    // Always return 200 immediately
    res.sendStatus(200);
  } catch (error) {
    console.error('Green API webhook error:', error);
    // Still return 200 to prevent retries for processing errors
    res.sendStatus(200);
  }
});

// Stripe webhook
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('❌ Stripe webhook secret not configured');
      return res.sendStatus(500);
    }
    
    const stripe = require('../../config/stripe');
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    
    console.log('💳 Stripe webhook received:', event.type);
    
    // Process webhook asynchronously
    stripeWebhookHandler.handleEvent(event).catch((error) => {
      console.error('Error processing Stripe webhook:', error);
    });
    
    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Mobile Money webhook (generic - adapt based on provider)
router.post('/mobilemoney', async (req, res) => {
  try {
    console.log('📲 Mobile Money webhook received');
    
    // Process webhook asynchronously
    mobileMoneyWebhookHandler.handleWebhook(req.body).catch((error) => {
      console.error('Error processing Mobile Money webhook:', error);
    });
    
    res.sendStatus(200);
  } catch (error) {
    console.error('Mobile Money webhook error:', error);
    res.sendStatus(200);
  }
});

module.exports = router;

