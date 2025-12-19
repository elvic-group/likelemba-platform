/**
 * Payouts Service
 * Payout management and processing
 */
const { query } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');
const ledgerService = require('../ledger');

class PayoutsService {
  /**
   * Create payout
   */
  async createPayout(payoutData) {
    try {
      const {
        cycleId,
        recipientUserId,
        amount,
        currency = 'KES',
        scheduledAt,
        provider = null,
      } = payoutData;

      const payoutId = uuidv4();

      const result = await query(
        `INSERT INTO payouts (
          id, cycle_id, recipient_user_id, amount, currency, provider, status, scheduled_at
        ) VALUES ($1, $2, $3, $4, $5, $6, 'scheduled', $7)
        RETURNING *`,
        [payoutId, cycleId, recipientUserId, amount, currency, provider, scheduledAt]
      );

      // Record ledger event
      await ledgerService.recordEvent({
        eventType: 'payout.scheduled',
        subjectType: 'payout',
        subjectId: payoutId,
        payload: {
          cycleId,
          recipientUserId,
          amount,
          currency,
          scheduledAt,
        },
      });

      return result.rows[0];
    } catch (error) {
      console.error('Error creating payout:', error);
      throw error;
    }
  }

  /**
   * Get payout by ID
   */
  async getPayoutById(payoutId) {
    try {
      const result = await query('SELECT * FROM payouts WHERE id = $1', [payoutId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting payout:', error);
      throw error;
    }
  }

  /**
   * Complete payout
   */
  async completePayout(payoutId, providerRef) {
    try {
      await query(
        `UPDATE payouts 
         SET status = 'completed', provider_ref = $1, completed_at = NOW(), updated_at = NOW()
         WHERE id = $2`,
        [providerRef, payoutId]
      );

      const payout = await this.getPayoutById(payoutId);

      // Record ledger event
      await ledgerService.recordEvent({
        eventType: 'payout.completed',
        subjectType: 'payout',
        subjectId: payoutId,
        payload: {
          providerRef,
          amount: payout.amount,
        },
      });

      return payout;
    } catch (error) {
      console.error('Error completing payout:', error);
      throw error;
    }
  }
}

module.exports = new PayoutsService();

