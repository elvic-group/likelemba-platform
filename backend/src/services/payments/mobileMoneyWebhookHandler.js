/**
 * Mobile Money Webhook Handler
 * Processes mobile money provider webhooks (M-Pesa, Orange, Tigo, etc.)
 */
const paymentsService = require('./index');
const ledgerService = require('../ledger');

class MobileMoneyWebhookHandler {
  /**
   * Handle mobile money webhook
   * Adapt this based on your provider's webhook format
   */
  async handleWebhook(webhookData) {
    try {
      console.log('📲 Processing Mobile Money webhook');

      // Extract provider from webhook (adjust based on your provider)
      const provider = webhookData.provider || 'mpesa';
      const status = webhookData.status || webhookData.ResultCode;

      if (status === '0' || status === 'success' || webhookData.success === true) {
        await this.handlePaymentSuccess(webhookData, provider);
      } else {
        await this.handlePaymentFailure(webhookData, provider);
      }
    } catch (error) {
      console.error('Error handling Mobile Money webhook:', error);
      throw error;
    }
  }

  /**
   * Handle successful payment
   */
  async handlePaymentSuccess(webhookData, provider) {
    const transactionId = webhookData.TransactionID || webhookData.transaction_id;
    const amount = webhookData.Amount || webhookData.amount;
    const phone = webhookData.PhoneNumber || webhookData.phone;

    // Find payment by provider reference or metadata
    // This depends on how you store the initial payment request
    const payment = await paymentsService.getPaymentByProviderRef(transactionId);

    if (payment) {
      await paymentsService.handlePaymentSuccess(
        payment.id,
        transactionId,
        webhookData
      );
    } else {
      console.warn('Payment not found for transaction:', transactionId);
    }
  }

  /**
   * Handle failed payment
   */
  async handlePaymentFailure(webhookData, provider) {
    const transactionId = webhookData.TransactionID || webhookData.transaction_id;

    const payment = await paymentsService.getPaymentByProviderRef(transactionId);

    if (payment) {
      const { query } = require('../../config/database');
      await query(
        `UPDATE payments 
         SET status = 'failed', updated_at = NOW()
         WHERE id = $1`,
        [payment.id]
      );

      await ledgerService.recordEvent({
        eventType: 'payment.failed',
        subjectType: 'payment',
        subjectId: payment.id,
        payload: {
          provider,
          transactionId,
          failureReason: webhookData.ResultDesc || webhookData.message,
        },
      });
    }
  }
}

module.exports = new MobileMoneyWebhookHandler();

