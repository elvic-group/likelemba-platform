/**
 * Escrow Service
 * Escrow account management, deposits, releases, freezes
 */
const { query, transaction } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');
const ledgerService = require('../ledger');

class EscrowService {
  /**
   * Get or create escrow account
   */
  async getOrCreateEscrowAccount(groupId, cycleId) {
    try {
      let result = await query(
        'SELECT * FROM escrow_accounts WHERE group_id = $1 AND cycle_id = $2',
        [groupId, cycleId]
      );

      if (result.rows[0]) {
        return result.rows[0];
      }

      // Create new escrow account
      const accountId = uuidv4();
      result = await query(
        `INSERT INTO escrow_accounts (
          id, group_id, cycle_id, balance_available, balance_frozen, currency, status
        ) VALUES ($1, $2, $3, 0, 0, 'KES', 'active')
        RETURNING *`,
        [accountId, groupId, cycleId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error getting/creating escrow account:', error);
      throw error;
    }
  }

  /**
   * Deposit funds to escrow
   */
  async deposit(groupId, cycleId, amount, referenceId, notes = '') {
    try {
      const account = await this.getOrCreateEscrowAccount(groupId, cycleId);

      await transaction(async (client) => {
        // Update escrow balance
        await client.query(
          `UPDATE escrow_accounts 
           SET balance_available = balance_available + $1, updated_at = NOW()
           WHERE id = $2`,
          [amount, account.id]
        );

        // Record transaction
        await client.query(
          `INSERT INTO escrow_transactions (
            escrow_account_id, transaction_type, amount, reference_id, notes
          ) VALUES ($1, 'deposit', $2, $3, $4)`,
          [account.id, amount, referenceId, notes]
        );
      });

      // Record ledger event
      await ledgerService.recordEvent({
        eventType: 'escrow.deposit.recorded',
        subjectType: 'escrow',
        subjectId: account.id,
        groupId,
        cycleId,
        payload: {
          amount,
          referenceId,
          notes,
        },
      });

      return account;
    } catch (error) {
      console.error('Error depositing to escrow:', error);
      throw error;
    }
  }

  /**
   * Release funds from escrow
   */
  async release(groupId, cycleId, amount, payoutId, notes = '') {
    try {
      const account = await this.getOrCreateEscrowAccount(groupId, cycleId);

      if (account.balance_available < amount) {
        throw new Error('Insufficient escrow balance');
      }

      await transaction(async (client) => {
        // Update escrow balance
        await client.query(
          `UPDATE escrow_accounts 
           SET balance_available = balance_available - $1, updated_at = NOW()
           WHERE id = $2`,
          [amount, account.id]
        );

        // Record transaction
        await client.query(
          `INSERT INTO escrow_transactions (
            escrow_account_id, transaction_type, amount, reference_id, notes
          ) VALUES ($1, 'release', $2, $3, $4)`,
          [account.id, amount, payoutId, notes]
        );
      });

      // Record ledger event
      await ledgerService.recordEvent({
        eventType: 'escrow.funds.released',
        subjectType: 'escrow',
        subjectId: account.id,
        groupId,
        cycleId,
        payload: {
          amount,
          payoutId,
          notes,
        },
      });

      return account;
    } catch (error) {
      console.error('Error releasing from escrow:', error);
      throw error;
    }
  }

  /**
   * Freeze funds in escrow (for disputes)
   */
  async freeze(groupId, cycleId, amount, disputeId, notes = '') {
    try {
      const account = await this.getOrCreateEscrowAccount(groupId, cycleId);

      if (account.balance_available < amount) {
        throw new Error('Insufficient escrow balance to freeze');
      }

      await transaction(async (client) => {
        // Move from available to frozen
        await client.query(
          `UPDATE escrow_accounts 
           SET balance_available = balance_available - $1,
               balance_frozen = balance_frozen + $1,
               updated_at = NOW()
           WHERE id = $2`,
          [amount, account.id]
        );

        // Record transaction
        await client.query(
          `INSERT INTO escrow_transactions (
            escrow_account_id, transaction_type, amount, reference_id, notes
          ) VALUES ($1, 'freeze', $2, $3, $4)`,
          [account.id, amount, disputeId, notes]
        );
      });

      // Record ledger event
      await ledgerService.recordEvent({
        eventType: 'escrow.funds.frozen',
        subjectType: 'escrow',
        subjectId: account.id,
        groupId,
        cycleId,
        payload: {
          amount,
          disputeId,
          notes,
        },
      });

      return account;
    } catch (error) {
      console.error('Error freezing escrow:', error);
      throw error;
    }
  }

  /**
   * Unfreeze funds in escrow
   */
  async unfreeze(groupId, cycleId, amount, disputeId, notes = '') {
    try {
      const account = await this.getOrCreateEscrowAccount(groupId, cycleId);

      if (account.balance_frozen < amount) {
        throw new Error('Insufficient frozen balance to unfreeze');
      }

      await transaction(async (client) => {
        // Move from frozen to available
        await client.query(
          `UPDATE escrow_accounts 
           SET balance_available = balance_available + $1,
               balance_frozen = balance_frozen - $1,
               updated_at = NOW()
           WHERE id = $2`,
          [amount, account.id]
        );

        // Record transaction
        await client.query(
          `INSERT INTO escrow_transactions (
            escrow_account_id, transaction_type, amount, reference_id, notes
          ) VALUES ($1, 'unfreeze', $2, $3, $4)`,
          [account.id, amount, disputeId, notes]
        );
      });

      return account;
    } catch (error) {
      console.error('Error unfreezing escrow:', error);
      throw error;
    }
  }

  /**
   * Get escrow balance
   */
  async getBalance(groupId, cycleId) {
    try {
      const account = await this.getOrCreateEscrowAccount(groupId, cycleId);
      return {
        available: parseFloat(account.balance_available),
        frozen: parseFloat(account.balance_frozen),
        total: parseFloat(account.balance_available) + parseFloat(account.balance_frozen),
        currency: account.currency,
      };
    } catch (error) {
      console.error('Error getting escrow balance:', error);
      throw error;
    }
  }
}

module.exports = new EscrowService();

