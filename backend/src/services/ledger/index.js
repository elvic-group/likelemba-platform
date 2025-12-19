/**
 * Ledger Service
 * Event store - append-only ledger with hash chain for tamper detection
 */
const { query } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

class LedgerService {
  /**
   * Record event in ledger
   */
  async recordEvent(eventData) {
    try {
      const {
        eventType,
        actorType = 'system',
        actorId = null,
        subjectType,
        subjectId,
        groupId = null,
        cycleId = null,
        payload = {},
      } = eventData;

      // Generate event ID
      const eventId = `evt_${uuidv4()}`;

      // Get previous hash for chain
      const previousEvent = await this.getLastEvent();
      const previousHash = previousEvent?.hash_chain || null;

      // Create hash chain
      const hashInput = JSON.stringify({
        eventId,
        eventType,
        occurredAt: new Date().toISOString(),
        previousHash,
        payload,
      });
      const hashChain = crypto.createHash('sha256').update(hashInput).digest('hex');

      // Insert event
      await query(
        `INSERT INTO ledger_events (
          event_id, event_type, occurred_at, actor_type, actor_id,
          subject_type, subject_id, group_id, cycle_id, payload_json,
          hash_chain, previous_hash
        ) VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          eventId,
          eventType,
          actorType,
          actorId,
          subjectType,
          subjectId,
          groupId,
          cycleId,
          JSON.stringify(payload),
          hashChain,
          previousHash,
        ]
      );

      console.log(`📝 Ledger event recorded: ${eventType} (${eventId})`);

      return { eventId, hashChain };
    } catch (error) {
      console.error('Error recording ledger event:', error);
      throw error;
    }
  }

  /**
   * Get last event (for hash chain)
   */
  async getLastEvent() {
    try {
      const result = await query(
        'SELECT * FROM ledger_events ORDER BY created_at DESC LIMIT 1'
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting last event:', error);
      return null;
    }
  }

  /**
   * Get events by type
   */
  async getEventsByType(eventType, limit = 100) {
    try {
      const result = await query(
        `SELECT * FROM ledger_events 
         WHERE event_type = $1 
         ORDER BY created_at DESC 
         LIMIT $2`,
        [eventType, limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting events by type:', error);
      throw error;
    }
  }

  /**
   * Get events for group
   */
  async getGroupEvents(groupId, limit = 100) {
    try {
      const result = await query(
        `SELECT * FROM ledger_events 
         WHERE group_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2`,
        [groupId, limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting group events:', error);
      throw error;
    }
  }

  /**
   * Verify ledger integrity (check hash chain)
   */
  async verifyIntegrity() {
    try {
      const result = await query(
        'SELECT * FROM ledger_events ORDER BY created_at ASC'
      );

      let previousHash = null;
      let isValid = true;
      const errors = [];

      for (const event of result.rows) {
        const hashInput = JSON.stringify({
          eventId: event.event_id,
          eventType: event.event_type,
          occurredAt: event.occurred_at,
          previousHash,
          payload: event.payload_json,
        });
        const expectedHash = crypto.createHash('sha256').update(hashInput).digest('hex');

        if (event.hash_chain !== expectedHash) {
          isValid = false;
          errors.push({
            eventId: event.event_id,
            expected: expectedHash,
            actual: event.hash_chain,
          });
        }

        previousHash = event.hash_chain;
      }

      return { isValid, errors };
    } catch (error) {
      console.error('Error verifying ledger integrity:', error);
      throw error;
    }
  }
}

module.exports = new LedgerService();

