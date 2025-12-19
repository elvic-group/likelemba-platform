/**
 * Cycles Service
 * Cycle (round) management and operations
 */
const { query } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');

class CyclesService {
  /**
   * Get cycle by ID
   */
  async getCycleById(cycleId) {
    try {
      const result = await query('SELECT * FROM cycles WHERE id = $1', [cycleId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting cycle:', error);
      throw error;
    }
  }

  /**
   * Get cycles for group
   */
  async getGroupCycles(groupId) {
    try {
      const result = await query(
        `SELECT * FROM cycles 
         WHERE group_id = $1 
         ORDER BY cycle_number ASC`,
        [groupId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting group cycles:', error);
      throw error;
    }
  }

  /**
   * Create cycle for group
   */
  async createCycle(groupId, cycleNumber, startDate, dueDate, payoutDate = null) {
    try {
      const cycleId = uuidv4();

      const result = await query(
        `INSERT INTO cycles (
          id, group_id, cycle_number, start_date, due_date, payout_date, status
        ) VALUES ($1, $2, $3, $4, $5, $6, 'pending')
        RETURNING *`,
        [cycleId, groupId, cycleNumber, startDate, dueDate, payoutDate]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating cycle:', error);
      throw error;
    }
  }

  /**
   * Get pending contributions for user
   */
  async getPendingContributions(userId) {
    try {
      const result = await query(
        `SELECT c.*, cy.group_id, g.name as group_name, g.currency
         FROM contributions c
         INNER JOIN cycles cy ON c.cycle_id = cy.id
         INNER JOIN groups g ON cy.group_id = g.id
         WHERE c.user_id = $1 
         AND c.status = 'pending'
         AND c.due_at > NOW()
         ORDER BY c.due_at ASC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting pending contributions:', error);
      throw error;
    }
  }

  /**
   * Get next payout for user
   */
  async getNextPayout(userId) {
    try {
      const result = await query(
        `SELECT p.*, cy.group_id, g.name as group_name, g.currency
         FROM payouts p
         INNER JOIN cycles cy ON p.cycle_id = cy.id
         INNER JOIN groups g ON cy.group_id = g.id
         WHERE p.recipient_user_id = $1
         AND p.status = 'scheduled'
         ORDER BY p.scheduled_at ASC
         LIMIT 1`,
        [userId]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting next payout:', error);
      throw error;
    }
  }

  /**
   * Check cycle quorum
   */
  async checkCycleQuorum(cycleId) {
    try {
      const result = await query(
        `SELECT 
          COUNT(*) as total_contributions,
          COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_contributions,
          COUNT(DISTINCT user_id) as unique_contributors
         FROM contributions
         WHERE cycle_id = $1`,
        [cycleId]
      );

      const stats = result.rows[0];

      // Get group members count
      const cycle = await this.getCycleById(cycleId);
      const groupResult = await query('SELECT members_count FROM groups WHERE id = $1', [cycle.group_id]);
      const membersCount = groupResult.rows[0]?.members_count || 0;

      // Quorum is met if at least 80% of members have paid
      const quorumThreshold = Math.ceil(membersCount * 0.8);
      const quorumMet = stats.paid_contributions >= quorumThreshold;

      if (quorumMet) {
        await query(
          `UPDATE cycles 
           SET quorum_met = TRUE, quorum_count = $1, updated_at = NOW()
           WHERE id = $2`,
          [stats.paid_contributions, cycleId]
        );
      }

      return {
        quorumMet,
        paidContributions: parseInt(stats.paid_contributions),
        totalMembers: membersCount,
        threshold: quorumThreshold,
      };
    } catch (error) {
      console.error('Error checking cycle quorum:', error);
      throw error;
    }
  }
}

module.exports = new CyclesService();

