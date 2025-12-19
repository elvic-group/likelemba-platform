/**
 * Groups Service
 * Group management and operations
 */
const { query, transaction } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

class GroupsService {
  /**
   * Get user's groups
   */
  async getUserGroups(userId) {
    try {
      const result = await query(
        `SELECT g.*, gm.role as member_role
         FROM groups g
         INNER JOIN group_members gm ON g.id = gm.group_id
         WHERE gm.user_id = $1 AND gm.status = 'active'
         ORDER BY g.created_at DESC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting user groups:', error);
      throw error;
    }
  }

  /**
   * Get group by ID
   */
  async getGroupById(groupId) {
    try {
      const result = await query('SELECT * FROM groups WHERE id = $1', [groupId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting group:', error);
      throw error;
    }
  }

  /**
   * Get group by invite code
   */
  async getGroupByInviteCode(inviteCode) {
    try {
      const result = await query('SELECT * FROM groups WHERE invite_code = $1', [inviteCode]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting group by invite code:', error);
      throw error;
    }
  }

  /**
   * Create new group
   */
  async createGroup(groupData) {
    try {
      const {
        ownerUserId,
        name,
        currency = 'KES',
        contributionAmount,
        frequency,
        startDate,
        membersCount,
        payoutOrderType = 'random',
        rules = {},
      } = groupData;

      // Generate invite code
      const inviteCode = this.generateInviteCode();
      const inviteLink = `${process.env.APP_URL || 'https://likelemba.com'}/join/${inviteCode}`;

      const groupId = uuidv4();

      const result = await query(
        `INSERT INTO groups (
          id, owner_user_id, name, currency, contribution_amount, frequency,
          start_date, members_count, payout_order_type, rules_json, invite_code, invite_link
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [
          groupId,
          ownerUserId,
          name,
          currency,
          contributionAmount,
          frequency,
          startDate,
          membersCount,
          payoutOrderType,
          JSON.stringify(rules),
          inviteCode,
          inviteLink,
        ]
      );

      const group = result.rows[0];

      // Add owner as admin member
      await this.addMember(groupId, ownerUserId, 'admin');

      // Initialize cycles for the group
      const cycleScheduler = require('../cycles/scheduler');
      await cycleScheduler.initializeGroupCycles(groupId);

      return group;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  /**
   * Add member to group
   */
  async addMember(groupId, userId, role = 'member') {
    try {
      const result = await query(
        `INSERT INTO group_members (group_id, user_id, role, status)
         VALUES ($1, $2, $3, 'active')
         ON CONFLICT (group_id, user_id) 
         DO UPDATE SET status = 'active', role = $3
         RETURNING *`,
        [groupId, userId, role]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  }

  /**
   * Remove member from group
   */
  async removeMember(groupId, userId) {
    try {
      await query(
        `UPDATE group_members 
         SET status = 'removed', updated_at = NOW()
         WHERE group_id = $1 AND user_id = $2`,
        [groupId, userId]
      );

      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  }

  /**
   * Get group members
   */
  async getGroupMembers(groupId) {
    try {
      const result = await query(
        `SELECT u.*, gm.role, gm.joined_at
         FROM group_members gm
         INNER JOIN users u ON gm.user_id = u.id
         WHERE gm.group_id = $1 AND gm.status = 'active'
         ORDER BY gm.joined_at ASC`,
        [groupId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting group members:', error);
      throw error;
    }
  }

  /**
   * Update group rules
   */
  async updateGroupRules(groupId, rules) {
    try {
      const result = await query(
        `UPDATE groups 
         SET rules_json = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [JSON.stringify(rules), groupId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error updating group rules:', error);
      throw error;
    }
  }

  /**
   * Generate unique invite code
   */
  generateInviteCode() {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }
}

module.exports = new GroupsService();

