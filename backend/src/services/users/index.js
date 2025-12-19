/**
 * Users Service
 * User management and authentication
 */
const { query } = require('../../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class UsersService {
  /**
   * Get user by phone number
   */
  async getUserByPhone(phone) {
    try {
      if (!phone) {
        return null;
      }

      const result = await query('SELECT * FROM users WHERE phone_e164 = $1', [phone]);

      const user = result.rows[0] || null;

      // Parse JSON fields if needed
      if (user) {
        // Add any JSON parsing if needed in future
      }

      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  /**
   * Create new user
   */
  async createUser(phone, displayName = null) {
    try {
      const userId = uuidv4();
      const result = await query(
        `INSERT INTO users (id, phone_e164, display_name, locale, status, role)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [userId, phone, displayName || 'User', 'en', 'active', 'member']
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(userId, updates) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      Object.keys(updates).forEach((key) => {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      });

      values.push(userId);

      const result = await query(
        `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`,
        values
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Set user PIN
   */
  async setUserPIN(userId, pin) {
    try {
      const pinHash = await bcrypt.hash(pin, 10);
      await query('UPDATE users SET pin_hash = $1 WHERE id = $2', [pinHash, userId]);
      return true;
    } catch (error) {
      console.error('Error setting PIN:', error);
      throw error;
    }
  }

  /**
   * Verify user PIN
   */
  async verifyPIN(userId, pin) {
    try {
      const result = await query('SELECT pin_hash FROM users WHERE id = $1', [userId]);
      const user = result.rows[0];

      if (!user || !user.pin_hash) {
        return false;
      }

      return await bcrypt.compare(pin, user.pin_hash);
    } catch (error) {
      console.error('Error verifying PIN:', error);
      return false;
    }
  }

  /**
   * Create OTP session
   */
  async createOTPSession(userId, otp) {
    try {
      const otpHash = await bcrypt.hash(otp, 10);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const result = await query(
        `INSERT INTO auth_sessions (user_id, otp_hash, otp_expires_at)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [userId, otpHash, expiresAt]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating OTP session:', error);
      throw error;
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(userId, otp) {
    try {
      const result = await query(
        `SELECT * FROM auth_sessions 
         WHERE user_id = $1 
         AND otp_expires_at > NOW()
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId]
      );

      const session = result.rows[0];
      if (!session) {
        return false;
      }

      const isValid = await bcrypt.compare(otp, session.otp_hash);

      if (isValid) {
        await query('UPDATE auth_sessions SET verified_at = NOW() WHERE id = $1', [session.id]);
      }

      return isValid;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return false;
    }
  }
}

module.exports = new UsersService();

