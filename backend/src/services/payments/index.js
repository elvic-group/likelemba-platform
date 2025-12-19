/**
 * Payments Service
 * Payment processing and management
 */
const { query } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');
const stripe = require('../../config/stripe');
const escrowService = require('../escrow');
const ledgerService = require('../ledger');

class PaymentsService {
  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId) {
    try {
      const result = await query('SELECT * FROM payments WHERE id = $1', [paymentId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting payment:', error);
      throw error;
    }
  }

  /**
   * Get payment by provider reference
   */
  async getPaymentByProviderRef(providerRef) {
    try {
      const result = await query('SELECT * FROM payments WHERE provider_ref = $1', [providerRef]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting payment by provider ref:', error);
      throw error;
    }
  }

  /**
   * Create Stripe payment intent
   */
  async createStripePaymentIntent(contributionId, amount, currency = 'KES', metadata = {}) {
    try {
      const contribution = await query('SELECT * FROM contributions WHERE id = $1', [contributionId]);
      if (!contribution.rows[0]) {
        throw new Error('Contribution not found');
      }

      const paymentId = uuidv4();
      const amountInCents = Math.round(amount * 100); // Stripe uses cents

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: currency.toLowerCase(),
        metadata: {
          payment_id: paymentId,
          contribution_id: contributionId,
          ...metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Create payment record
      await query(
        `INSERT INTO payments (
          id, contribution_id, provider, provider_ref, amount, currency, status
        ) VALUES ($1, $2, $3, $4, $5, $6, 'pending')`,
        [paymentId, contributionId, 'stripe', paymentIntent.id, amount, currency]
      );

      // Record ledger event
      await ledgerService.recordEvent({
        eventType: 'payment.intent.created',
        subjectType: 'payment',
        subjectId: paymentId,
        payload: {
          provider: 'stripe',
          amount,
          currency,
          paymentIntentId: paymentIntent.id,
        },
      });

      return {
        paymentId,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Error creating Stripe payment intent:', error);
      throw error;
    }
  }

  /**
   * Create Stripe checkout session
   */
  async createStripeCheckoutSession(contributionId, amount, currency = 'KES', metadata = {}) {
    try {
      const contribution = await query('SELECT * FROM contributions WHERE id = $1', [contributionId]);
      if (!contribution.rows[0]) {
        throw new Error('Contribution not found');
      }

      const paymentId = uuidv4();
      const amountInCents = Math.round(amount * 100);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: 'Likelemba Contribution',
                description: 'Group contribution payment',
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.APP_URL || 'https://likelemba.com'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL || 'https://likelemba.com'}/payment/cancel`,
        metadata: {
          payment_id: paymentId,
          contribution_id: contributionId,
          ...metadata,
        },
      });

      // Create payment record
      await query(
        `INSERT INTO payments (
          id, contribution_id, provider, provider_ref, amount, currency, status
        ) VALUES ($1, $2, $3, $4, $5, $6, 'pending')`,
        [paymentId, contributionId, 'stripe', session.id, amount, currency]
      );

      return {
        paymentId,
        checkoutUrl: session.url,
        sessionId: session.id,
      };
    } catch (error) {
      console.error('Error creating Stripe checkout session:', error);
      throw error;
    }
  }

  /**
   * Handle payment success
   */
  async handlePaymentSuccess(paymentId, providerRef, providerData = {}) {
    try {
      // Update payment status
      await query(
        `UPDATE payments 
         SET status = 'succeeded', raw_payload_json = $1, updated_at = NOW()
         WHERE id = $2`,
        [JSON.stringify(providerData), paymentId]
      );

      // Get payment and contribution
      const payment = await this.getPaymentById(paymentId);
      const contribution = await query('SELECT * FROM contributions WHERE id = $1', [payment.contribution_id]);

      if (contribution.rows[0]) {
        // Update contribution
        await query(
          `UPDATE contributions 
           SET status = 'paid', paid_at = NOW(), updated_at = NOW()
           WHERE id = $1`,
          [payment.contribution_id]
        );

        // Record escrow deposit
        const cycle = await query('SELECT * FROM cycles WHERE id = $1', [contribution.rows[0].cycle_id]);
        if (cycle.rows[0]) {
          await escrowService.deposit(cycle.rows[0].group_id, cycle.rows[0].id, payment.amount, paymentId);
        }

        // Record ledger event
        await ledgerService.recordEvent({
          eventType: 'payment.captured',
          subjectType: 'payment',
          subjectId: paymentId,
          payload: {
            provider: payment.provider,
            amount: payment.amount,
            currency: payment.currency,
            providerRef,
          },
        });
      }

      return payment;
    } catch (error) {
      console.error('Error handling payment success:', error);
      throw error;
    }
  }

  /**
   * Get user receipts
   */
  async getUserReceipts(userId) {
    try {
      const result = await query(
        `SELECT p.*, c.cycle_id, cy.group_id, g.name as group_name
         FROM payments p
         INNER JOIN contributions c ON p.contribution_id = c.id
         INNER JOIN cycles cy ON c.cycle_id = cy.id
         INNER JOIN groups g ON cy.group_id = g.id
         WHERE c.user_id = $1
         AND p.status = 'succeeded'
         ORDER BY p.created_at DESC
         LIMIT 50`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting user receipts:', error);
      throw error;
    }
  }
}

module.exports = new PaymentsService();

