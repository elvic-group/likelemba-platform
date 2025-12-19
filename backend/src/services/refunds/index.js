/**
 * Refunds Service
 * Refund management and processing
 */
const { query } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');
const stripe = require('../../config/stripe');
const ledgerService = require('../ledger');

class RefundsService {
  /**
   * Get refund by ID
   */
  async getRefundById(refundId) {
    try {
      const result = await query('SELECT * FROM refunds WHERE id = $1', [refundId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting refund:', error);
      throw error;
    }
  }

  /**
   * Request refund
   */
  async requestRefund(refundData) {
    try {
      const {
        paymentId,
        amount,
        currency = 'KES',
        reason,
        requestedByUserId,
      } = refundData;

      // Get payment
      const payment = await query('SELECT * FROM payments WHERE id = $1', [paymentId]);
      if (!payment.rows[0]) {
        throw new Error('Payment not found');
      }

      const refundId = uuidv4();

      const result = await query(
        `INSERT INTO refunds (
          id, payment_id, amount, currency, reason, status, requested_by_user_id
        ) VALUES ($1, $2, $3, $4, $5, 'requested', $6)
        RETURNING *`,
        [refundId, paymentId, amount, currency, reason, requestedByUserId]
      );

      // Record ledger event
      await ledgerService.recordEvent({
        eventType: 'refund.requested',
        subjectType: 'refund',
        subjectId: refundId,
        actorType: 'user',
        actorId: requestedByUserId,
        payload: {
          paymentId,
          amount,
          currency,
          reason,
        },
      });

      return result.rows[0];
    } catch (error) {
      console.error('Error requesting refund:', error);
      throw error;
    }
  }

  /**
   * Approve refund
   */
  async approveRefund(refundId, approvedByUserId) {
    try {
      await query(
        `UPDATE refunds 
         SET status = 'approved', approved_by_user_id = $1, updated_at = NOW()
         WHERE id = $2`,
        [approvedByUserId, refundId]
      );

      const refund = await this.getRefundById(refundId);

      // Record ledger event
      await ledgerService.recordEvent({
        eventType: 'refund.approved',
        subjectType: 'refund',
        subjectId: refundId,
        actorType: 'user',
        actorId: approvedByUserId,
        payload: {
          paymentId: refund.payment_id,
          amount: refund.amount,
        },
      });

      // Auto-execute if approved
      await this.executeRefund(refundId);

      return refund;
    } catch (error) {
      console.error('Error approving refund:', error);
      throw error;
    }
  }

  /**
   * Execute refund
   */
  async executeRefund(refundId) {
    try {
      const refund = await this.getRefundById(refundId);
      if (!refund || refund.status !== 'approved') {
        throw new Error('Refund not approved');
      }

      const payment = await query('SELECT * FROM payments WHERE id = $1', [refund.payment_id]);
      const paymentData = payment.rows[0];

      // Process refund based on provider
      let providerRef = null;

      if (paymentData.provider === 'stripe') {
        // Stripe refund
        const stripeRefund = await stripe.refunds.create({
          payment_intent: paymentData.provider_ref,
          amount: Math.round(refund.amount * 100), // Convert to cents
        });
        providerRef = stripeRefund.id;
      } else {
        // Mobile money refund - implement based on provider
        console.log('Mobile money refund - implement provider-specific logic');
      }

      // Update refund status
      await query(
        `UPDATE refunds 
         SET status = 'executed', provider_ref = $1, updated_at = NOW()
         WHERE id = $2`,
        [providerRef, refundId]
      );

      // Record ledger event
      await ledgerService.recordEvent({
        eventType: 'refund.executed',
        subjectType: 'refund',
        subjectId: refundId,
        payload: {
          paymentId: refund.payment_id,
          amount: refund.amount,
          providerRef,
        },
      });

      return refund;
    } catch (error) {
      console.error('Error executing refund:', error);
      
      // Mark as failed
      await query(
        `UPDATE refunds 
         SET status = 'failed', updated_at = NOW()
         WHERE id = $1`,
        [refundId]
      );

      throw error;
    }
  }

  /**
   * Complete refund (after webhook confirmation)
   */
  async completeRefund(refundId, providerRef) {
    try {
      await query(
        `UPDATE refunds 
         SET status = 'completed', provider_ref = $1, updated_at = NOW()
         WHERE id = $2`,
        [providerRef, refundId]
      );

      const refund = await this.getRefundById(refundId);

      // Record ledger event
      await ledgerService.recordEvent({
        eventType: 'refund.completed',
        subjectType: 'refund',
        subjectId: refundId,
        payload: {
          paymentId: refund.payment_id,
          amount: refund.amount,
          providerRef,
        },
      });

      return refund;
    } catch (error) {
      console.error('Error completing refund:', error);
      throw error;
    }
  }
}

module.exports = new RefundsService();

