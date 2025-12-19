/**
 * Notification Scheduler Service
 * Sends reminders, due date notifications, and escalations
 */
const cron = require('node-cron');
const { query } = require('../../config/database');
const whatsappHandler = require('../whatsapp/handler');
const templates = require('../../templates/whatsapp');
const cyclesService = require('../cycles');

class NotificationScheduler {
  /**
   * Initialize scheduler
   */
  start() {
    console.log('📅 Starting notification scheduler...');

    // Check for due contributions every hour
    cron.schedule('0 * * * *', async () => {
      await this.checkDueContributions();
    });

    // Check for overdue contributions every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      await this.checkOverdueContributions();
    });

    // Check for cycle quorum every hour
    cron.schedule('0 * * * *', async () => {
      await this.checkCycleQuorum();
    });

    // Check for scheduled payouts daily at 9 AM
    cron.schedule('0 9 * * *', async () => {
      await this.processScheduledPayouts();
    });

    // Check for cycles to start daily at 8 AM
    cron.schedule('0 8 * * *', async () => {
      await this.startDueCycles();
    });

    console.log('✅ Notification scheduler started');
  }

  /**
   * Check for contributions due soon (within 24 hours)
   */
  async checkDueContributions() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const result = await query(
        `SELECT c.*, u.phone_e164, u.display_name, g.name as group_name, g.currency
         FROM contributions c
         INNER JOIN users u ON c.user_id = u.id
         INNER JOIN cycles cy ON c.cycle_id = cy.id
         INNER JOIN groups g ON cy.group_id = g.id
         WHERE c.status = 'pending'
         AND c.due_at BETWEEN NOW() AND $1
         AND NOT EXISTS (
           SELECT 1 FROM scheduled_reminders sr
           WHERE sr.contribution_id = c.id
           AND sr.reminder_type = 'due_soon'
           AND sr.sent_at IS NOT NULL
         )`,
        [tomorrow]
      );

      for (const contribution of result.rows) {
        await this.sendDueReminder(contribution);
      }

      console.log(`📨 Sent ${result.rows.length} due reminders`);
    } catch (error) {
      console.error('Error checking due contributions:', error);
    }
  }

  /**
   * Check for overdue contributions
   */
  async checkOverdueContributions() {
    try {
      const result = await query(
        `SELECT c.*, u.phone_e164, u.display_name, g.name as group_name, g.currency,
         EXTRACT(DAY FROM NOW() - c.due_at)::INTEGER as days_late
         FROM contributions c
         INNER JOIN users u ON c.user_id = u.id
         INNER JOIN cycles cy ON c.cycle_id = cy.id
         INNER JOIN groups g ON cy.group_id = g.id
         WHERE c.status = 'pending'
         AND c.due_at < NOW()
         AND NOT EXISTS (
           SELECT 1 FROM scheduled_reminders sr
           WHERE sr.contribution_id = c.id
           AND sr.reminder_type = 'overdue'
           AND sr.sent_at > NOW() - INTERVAL '6 hours'
         )`,
        []
      );

      for (const contribution of result.rows) {
        await this.sendOverdueReminder(contribution);
      }

      console.log(`📨 Sent ${result.rows.length} overdue reminders`);
    } catch (error) {
      console.error('Error checking overdue contributions:', error);
    }
  }

  /**
   * Check cycle quorum and notify when met
   */
  async checkCycleQuorum() {
    try {
      const result = await query(
        `SELECT DISTINCT cy.id, cy.group_id, g.name as group_name
         FROM cycles cy
         INNER JOIN groups g ON cy.group_id = g.id
         WHERE cy.status = 'active'
         AND cy.quorum_met = FALSE
         AND cy.due_date <= NOW()`,
        []
      );

      for (const cycle of result.rows) {
        const quorumStatus = await cyclesService.checkCycleQuorum(cycle.id);
        if (quorumStatus.quorumMet) {
          await this.notifyQuorumMet(cycle, quorumStatus);
        }
      }
    } catch (error) {
      console.error('Error checking cycle quorum:', error);
    }
  }

  /**
   * Process scheduled payouts
   */
  async processScheduledPayouts() {
    try {
      const result = await query(
        `SELECT * FROM payouts
         WHERE status = 'scheduled'
         AND scheduled_at <= NOW()`,
        []
      );

      for (const payout of result.rows) {
        // Process payout (this would integrate with payment provider)
        console.log(`Processing payout: ${payout.id}`);
        // await payoutsService.executePayout(payout.id);
      }
    } catch (error) {
      console.error('Error processing scheduled payouts:', error);
    }
  }

  /**
   * Start cycles that are due to start
   */
  async startDueCycles() {
    try {
      const result = await query(
        `SELECT * FROM cycles
         WHERE status = 'pending'
         AND start_date <= CURRENT_DATE`,
        []
      );

      for (const cycle of result.rows) {
        const cycleScheduler = require('../cycles/scheduler');
        await cycleScheduler.startCycle(cycle.id);
        console.log(`Started cycle: ${cycle.id}`);
      }
    } catch (error) {
      console.error('Error starting due cycles:', error);
    }
  }

  /**
   * Send due reminder
   * Only sends to users who have contacted us first
   */
  async sendDueReminder(contribution) {
    try {
      // Only send to users who have contacted us first
      const userCheck = await query(
        `SELECT has_contacted_us FROM users WHERE phone_e164 = $1`,
        [contribution.phone_e164]
      );
      
      if (userCheck.rows.length === 0 || !userCheck.rows[0].has_contacted_us) {
        console.log(`⏭️ Skipping reminder to ${contribution.phone_e164} - user has not contacted us`);
        return;
      }

      const reminder = templates.contributions.dueReminder(
        contribution,
        contribution.group_name,
        contribution.display_name || 'Member'
      );

      await whatsappHandler.sendMessage(contribution.phone_e164, reminder);

      // Record reminder
      await query(
        `INSERT INTO scheduled_reminders (contribution_id, reminder_type, scheduled_at, sent_at, status)
         VALUES ($1, 'due_soon', NOW(), NOW(), 'sent')`,
        [contribution.id]
      );
    } catch (error) {
      console.error('Error sending due reminder:', error);
    }
  }

  /**
   * Send overdue reminder
   * Only sends to users who have contacted us first
   */
  async sendOverdueReminder(contribution) {
    try {
      // Only send to users who have contacted us first
      const userCheck = await query(
        `SELECT has_contacted_us FROM users WHERE phone_e164 = $1`,
        [contribution.phone_e164]
      );
      
      if (userCheck.rows.length === 0 || !userCheck.rows[0].has_contacted_us) {
        console.log(`⏭️ Skipping overdue reminder to ${contribution.phone_e164} - user has not contacted us`);
        return;
      }

      const reminder = templates.contributions.latePaymentNudge(
        contribution.group_name,
        contribution.display_name || 'Member',
        contribution.days_late,
        contribution.amount,
        contribution.currency
      );

      await whatsappHandler.sendMessage(contribution.phone_e164, reminder);

      // Record reminder
      await query(
        `INSERT INTO scheduled_reminders (contribution_id, reminder_type, scheduled_at, sent_at, status)
         VALUES ($1, 'overdue', NOW(), NOW(), 'sent')`,
        [contribution.id]
      );
    } catch (error) {
      console.error('Error sending overdue reminder:', error);
    }
  }

  /**
   * Notify when quorum is met
   */
  async notifyQuorumMet(cycle, quorumStatus) {
    try {
      // Get cycle details
      const cycleData = await cyclesService.getCycleById(cycle.id);
      const payoutOrder = JSON.parse(cycleData.payout_order_json || '[]');
      const recipient = payoutOrder.find((p) => p.userId === cycleData.current_recipient_user_id);

      // Get all group members
      const groupsService = require('../groups');
      const members = await groupsService.getGroupMembers(cycle.group_id);

      // Notify all members (only those who have contacted us)
      for (const member of members) {
        // Only send to users who have contacted us first
        const userCheck = await query(
          `SELECT has_contacted_us FROM users WHERE phone_e164 = $1`,
          [member.phone_e164]
        );
        
        if (userCheck.rows.length === 0 || !userCheck.rows[0].has_contacted_us) {
          console.log(`⏭️ Skipping quorum notification to ${member.phone_e164} - user has not contacted us`);
          continue;
        }

        const notification = templates.payouts.quorumMet(
          cycle.group_name,
          cycleData.payout_date,
          recipient?.name || 'Recipient'
        );

        await whatsappHandler.sendMessage(member.phone_e164, notification);
      }

      // Record notification
      for (const member of members) {
        await query(
          `INSERT INTO notifications (user_id, notification_type, title, message, related_group_id, related_cycle_id, sent_at)
           VALUES ($1, 'quorum_met', 'Quorum Met', 'Group has reached required contributions', $2, $3, NOW())`,
          [member.id, cycle.group_id, cycle.id]
        );
      }
    } catch (error) {
      console.error('Error notifying quorum met:', error);
    }
  }
}

module.exports = new NotificationScheduler();

