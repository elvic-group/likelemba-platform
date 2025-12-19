/**
 * Disputes Service
 * Dispute management and resolution
 */
const { query } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');
const escrowService = require('../escrow');
const ledgerService = require('../ledger');

class DisputesService {
  /**
   * Get dispute by ID
   */
  async getDisputeById(disputeId) {
    try {
      const result = await query('SELECT * FROM disputes WHERE id = $1', [disputeId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting dispute:', error);
      throw error;
    }
  }

  /**
   * Open dispute
   */
  async openDispute(disputeData) {
    try {
      const {
        groupId,
        cycleId,
        openedByUserId,
        disputeType,
        title,
        description,
      } = disputeData;

      const disputeId = uuidv4();

      const result = await query(
        `INSERT INTO disputes (
          id, group_id, cycle_id, opened_by_user_id, dispute_type, title, description, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'opened')
        RETURNING *`,
        [disputeId, groupId, cycleId, openedByUserId, disputeType, title, description]
      );

      // Freeze related escrow funds if needed
      if (cycleId) {
        const escrowBalance = await escrowService.getBalance(groupId, cycleId);
        if (escrowBalance.available > 0) {
          // Freeze 50% of available balance as precaution
          const freezeAmount = escrowBalance.available * 0.5;
          await escrowService.freeze(groupId, cycleId, freezeAmount, disputeId, 'Dispute opened');
        }
      }

      // Record ledger event
      await ledgerService.recordEvent({
        eventType: 'dispute.opened',
        subjectType: 'dispute',
        subjectId: disputeId,
        groupId,
        cycleId,
        actorType: 'user',
        actorId: openedByUserId,
        payload: {
          disputeType,
          title,
          description,
        },
      });

      return result.rows[0];
    } catch (error) {
      console.error('Error opening dispute:', error);
      throw error;
    }
  }

  /**
   * Add evidence to dispute
   */
  async addEvidence(disputeId, evidenceData) {
    try {
      const {
        evidenceType,
        fileUrl,
        description,
        uploadedByUserId,
      } = evidenceData;

      const evidenceId = uuidv4();

      await query(
        `INSERT INTO dispute_evidence (
          id, dispute_id, evidence_type, file_url, description, uploaded_by_user_id
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [evidenceId, disputeId, evidenceType, fileUrl, description, uploadedByUserId]
      );

      // Record ledger event
      await ledgerService.recordEvent({
        eventType: 'dispute.evidence.added',
        subjectType: 'dispute',
        subjectId: disputeId,
        actorType: 'user',
        actorId: uploadedByUserId,
        payload: {
          evidenceType,
          fileUrl,
        },
      });

      return { id: evidenceId };
    } catch (error) {
      console.error('Error adding evidence:', error);
      throw error;
    }
  }

  /**
   * Resolve dispute
   */
  async resolveDispute(disputeId, resolutionData) {
    try {
      const {
        outcome,
        outcomeAmount,
        resolvedByUserId,
        notes,
      } = resolutionData;

      const dispute = await this.getDisputeById(disputeId);
      if (!dispute) {
        throw new Error('Dispute not found');
      }

      // Update dispute
      await query(
        `UPDATE disputes 
         SET status = 'resolved', outcome = $1, outcome_amount = $2,
             resolved_by_user_id = $3, resolved_at = NOW(), notes = $4, updated_at = NOW()
         WHERE id = $5`,
        [outcome, outcomeAmount, resolvedByUserId, notes, disputeId]
      );

      // Handle escrow based on outcome
      if (dispute.cycle_id) {
        const escrowBalance = await escrowService.getBalance(dispute.group_id, dispute.cycle_id);
        
        if (outcome === 'refund' && outcomeAmount) {
          // Unfreeze and process refund
          await escrowService.unfreeze(dispute.group_id, dispute.cycle_id, escrowBalance.frozen, disputeId, 'Dispute resolved - refund');
        } else if (outcome === 'dismissed') {
          // Unfreeze funds
          await escrowService.unfreeze(dispute.group_id, dispute.cycle_id, escrowBalance.frozen, disputeId, 'Dispute dismissed');
        }
      }

      // Record ledger event
      await ledgerService.recordEvent({
        eventType: 'dispute.resolved',
        subjectType: 'dispute',
        subjectId: disputeId,
        groupId: dispute.group_id,
        cycleId: dispute.cycle_id,
        actorType: 'user',
        actorId: resolvedByUserId,
        payload: {
          outcome,
          outcomeAmount,
          notes,
        },
      });

      return dispute;
    } catch (error) {
      console.error('Error resolving dispute:', error);
      throw error;
    }
  }
}

module.exports = new DisputesService();

