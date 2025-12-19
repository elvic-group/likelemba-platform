/**
 * Cycle Scheduler Service
 * Automated cycle creation, payout order generation, and scheduling
 */
const { query } = require('../../config/database');
const cyclesService = require('./index');
const groupsService = require('../groups');
const escrowService = require('../escrow');
const payoutsService = require('../payouts');
const ledgerService = require('../ledger');
const { v4: uuidv4 } = require('uuid');

class CycleScheduler {
  /**
   * Initialize cycles for a new group
   */
  async initializeGroupCycles(groupId) {
    try {
      const group = await groupsService.getGroupById(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      const members = await groupsService.getGroupMembers(groupId);
      const membersCount = members.length;

      if (membersCount < 2) {
        throw new Error('Group needs at least 2 members');
      }

      // Calculate cycle dates based on frequency
      const startDate = new Date(group.start_date);
      const cycleDates = this.calculateCycleDates(startDate, group.frequency, membersCount);

      // Generate payout order
      const payoutOrder = this.generatePayoutOrder(members, group.payout_order_type);

      // Create cycles
      const cycles = [];
      for (let i = 0; i < membersCount; i++) {
        const cycleNumber = i + 1;
        const cycleStartDate = cycleDates[i].start;
        const cycleDueDate = cycleDates[i].due;
        const cyclePayoutDate = cycleDates[i].payout;

        const cycle = await cyclesService.createCycle(
          groupId,
          cycleNumber,
          cycleStartDate,
          cycleDueDate,
          cyclePayoutDate
        );

        // Set payout order
        await query(
          `UPDATE cycles 
           SET payout_order_json = $1, current_recipient_user_id = $2, updated_at = NOW()
           WHERE id = $3`,
          [JSON.stringify(payoutOrder), payoutOrder[i].userId, cycle.id]
        );

        // Create contributions for all members
        await this.createContributionsForCycle(cycle.id, members, group.contribution_amount, cycleDueDate);

        // Create escrow account for cycle
        await escrowService.getOrCreateEscrowAccount(groupId, cycle.id);

        cycles.push(cycle);
      }

      // Record ledger event
      await ledgerService.recordEvent({
        eventType: 'cycle.created',
        subjectType: 'group',
        subjectId: groupId,
        groupId,
        payload: {
          cyclesCount: cycles.length,
          payoutOrderType: group.payout_order_type,
        },
      });

      return cycles;
    } catch (error) {
      console.error('Error initializing group cycles:', error);
      throw error;
    }
  }

  /**
   * Calculate cycle dates based on frequency
   */
  calculateCycleDates(startDate, frequency, cyclesCount) {
    const dates = [];
    const start = new Date(startDate);

    for (let i = 0; i < cyclesCount; i++) {
      const cycleStart = new Date(start);
      const cycleDue = new Date(cycleStart);
      const cyclePayout = new Date(cycleStart);

      // Calculate dates based on frequency
      switch (frequency.toLowerCase()) {
        case 'weekly':
          cycleStart.setDate(start.getDate() + i * 7);
          cycleDue.setDate(cycleStart.getDate() + 7);
          cyclePayout.setDate(cycleDue.getDate() + 1);
          break;
        case 'biweekly':
          cycleStart.setDate(start.getDate() + i * 14);
          cycleDue.setDate(cycleStart.getDate() + 14);
          cyclePayout.setDate(cycleDue.getDate() + 1);
          break;
        case 'monthly':
          cycleStart.setMonth(start.getMonth() + i);
          cycleDue.setMonth(cycleStart.getMonth() + 1);
          cyclePayout.setDate(cycleDue.getDate() + 1);
          break;
        default:
          // Default to monthly
          cycleStart.setMonth(start.getMonth() + i);
          cycleDue.setMonth(cycleStart.getMonth() + 1);
          cyclePayout.setDate(cycleDue.getDate() + 1);
      }

      dates.push({
        start: cycleStart.toISOString().split('T')[0],
        due: cycleDue.toISOString().split('T')[0],
        payout: cyclePayout.toISOString().split('T')[0],
      });
    }

    return dates;
  }

  /**
   * Generate payout order based on type
   */
  generatePayoutOrder(members, orderType) {
    const membersList = members.map((m) => ({ userId: m.id, name: m.display_name || m.phone_e164 }));

    switch (orderType) {
      case 'random':
        // Shuffle array randomly
        for (let i = membersList.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [membersList[i], membersList[j]] = [membersList[j], membersList[i]];
        }
        break;
      case 'choose':
        // Members will choose order (for now, use random)
        // This would be implemented with user interaction
        for (let i = membersList.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [membersList[i], membersList[j]] = [membersList[j], membersList[i]];
        }
        break;
      case 'manual':
        // Admin will set order manually (for now, use join order)
        // Order is already in join order
        break;
      case 'auction':
        // Auction-based (for now, use random)
        // This would require bidding system
        for (let i = membersList.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [membersList[i], membersList[j]] = [membersList[j], membersList[i]];
        }
        break;
      default:
        // Default to random
        for (let i = membersList.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [membersList[i], membersList[j]] = [membersList[j], membersList[i]];
        }
    }

    return membersList;
  }

  /**
   * Create contributions for all members in a cycle
   */
  async createContributionsForCycle(cycleId, members, amount, dueDate) {
    try {
      for (const member of members) {
        const contributionId = uuidv4();
        await query(
          `INSERT INTO contributions (
            id, cycle_id, user_id, amount, due_at, status
          ) VALUES ($1, $2, $3, $4, $5, 'pending')`,
          [contributionId, cycleId, member.id, amount, dueDate]
        );
      }
    } catch (error) {
      console.error('Error creating contributions:', error);
      throw error;
    }
  }

  /**
   * Process cycle payout when quorum is met
   */
  async processCyclePayout(cycleId) {
    try {
      const cycle = await cyclesService.getCycleById(cycleId);
      if (!cycle || cycle.status !== 'active') {
        return;
      }

      // Check quorum
      const quorumStatus = await cyclesService.checkCycleQuorum(cycleId);
      if (!quorumStatus.quorumMet) {
        return;
      }

      // Get payout recipient
      const payoutOrder = JSON.parse(cycle.payout_order_json || '[]');
      const recipient = payoutOrder.find((p) => p.userId === cycle.current_recipient_user_id);

      if (!recipient) {
        throw new Error('Payout recipient not found');
      }

      // Get escrow balance
      const escrowBalance = await escrowService.getBalance(cycle.group_id, cycleId);
      const payoutAmount = escrowBalance.available;

      if (payoutAmount <= 0) {
        throw new Error('Insufficient escrow balance for payout');
      }

      // Create payout record
      const payout = await payoutsService.createPayout({
        cycleId,
        recipientUserId: recipient.userId,
        amount: payoutAmount,
        currency: 'KES',
        scheduledAt: cycle.payout_date,
      });

      // Release from escrow
      await escrowService.release(cycle.group_id, cycleId, payoutAmount, payout.id, 'Cycle payout');

      // Update cycle status
      await query(
        `UPDATE cycles 
         SET status = 'completed', updated_at = NOW()
         WHERE id = $1`,
        [cycleId]
      );

      // Record ledger event
      await ledgerService.recordEvent({
        eventType: 'payout.released',
        subjectType: 'payout',
        subjectId: payout.id,
        groupId: cycle.group_id,
        cycleId,
        payload: {
          amount: payoutAmount,
          recipientUserId: recipient.userId,
        },
      });

      return payout;
    } catch (error) {
      console.error('Error processing cycle payout:', error);
      throw error;
    }
  }

  /**
   * Start cycle when start date is reached
   */
  async startCycle(cycleId) {
    try {
      await query(
        `UPDATE cycles 
         SET status = 'active', updated_at = NOW()
         WHERE id = $1`,
        [cycleId]
      );

      const cycle = await cyclesService.getCycleById(cycleId);

      // Record ledger event
      await ledgerService.recordEvent({
        eventType: 'cycle.started',
        subjectType: 'cycle',
        subjectId: cycleId,
        groupId: cycle.group_id,
        cycleId,
        payload: {
          cycleNumber: cycle.cycle_number,
        },
      });

      return cycle;
    } catch (error) {
      console.error('Error starting cycle:', error);
      throw error;
    }
  }
}

module.exports = new CycleScheduler();

