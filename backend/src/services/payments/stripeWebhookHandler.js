/**
 * Stripe Webhook Handler
 * Processes Stripe webhook events
 */
const paymentsService = require('./index');
const ledgerService = require('../ledger');

class StripeWebhookHandler {
  /**
   * Handle Stripe webhook event
   */
  async handleEvent(event) {
    try {
      console.log(`💳 Processing Stripe event: ${event.type}`);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event);
          break;

        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event);
          break;

        case 'charge.refunded':
          await this.handleChargeRefunded(event);
          break;

        case 'charge.dispute.created':
        case 'charge.dispute.updated':
        case 'charge.dispute.closed':
          await this.handleDispute(event);
          break;

        default:
          console.log(`⚠️ Unhandled Stripe event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling Stripe webhook:', error);
      throw error;
    }
  }

  /**
   * Handle payment intent succeeded
   */
  async handlePaymentIntentSucceeded(event) {
    const paymentIntent = event.data.object;
    const metadata = paymentIntent.metadata;

    if (metadata.payment_id) {
      await paymentsService.handlePaymentSuccess(
        metadata.payment_id,
        paymentIntent.id,
        paymentIntent
      );
    }
  }

  /**
   * Handle payment intent failed
   */
  async handlePaymentIntentFailed(event) {
    const paymentIntent = event.data.object;
    const metadata = paymentIntent.metadata;

    if (metadata.payment_id) {
      const payment = await paymentsService.getPaymentById(metadata.payment_id);
      if (payment) {
        const { query } = require('../../config/database');
        await query(
          `UPDATE payments 
           SET status = 'failed', updated_at = NOW()
           WHERE id = $1`,
          [metadata.payment_id]
        );

        await ledgerService.recordEvent({
          eventType: 'payment.failed',
          subjectType: 'payment',
          subjectId: metadata.payment_id,
          payload: {
            provider: 'stripe',
            paymentIntentId: paymentIntent.id,
            failureReason: paymentIntent.last_payment_error?.message,
          },
        });
      }
    }
  }

  /**
   * Handle checkout session completed
   */
  async handleCheckoutSessionCompleted(event) {
    const session = event.data.object;
    const metadata = session.metadata;

    if (metadata.payment_id) {
      await paymentsService.handlePaymentSuccess(
        metadata.payment_id,
        session.id,
        session
      );
    }
  }

  /**
   * Handle charge refunded
   */
  async handleChargeRefunded(event) {
    const charge = event.data.object;
    // Handle refund - will be implemented in refund service
    console.log('Refund processed:', charge.id);
  }

  /**
   * Handle dispute
   */
  async handleDispute(event) {
    const dispute = event.data.object;
    // Handle dispute - will be implemented in dispute service
    console.log('Dispute event:', event.type, dispute.id);
  }
}

module.exports = new StripeWebhookHandler();

