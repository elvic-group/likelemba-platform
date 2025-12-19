/**
 * OTP Service
 * Generate and send OTP codes for authentication
 */
const { query } = require('../../config/database');
const usersService = require('./index');
const whatsappHandler = require('../whatsapp/handler');

class OTPService {
  /**
   * Generate random OTP
   */
  generateOTP(length = 6) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }

  /**
   * Send OTP to user
   */
  async sendOTP(phone, userId = null) {
    try {
      // Generate OTP
      const otp = this.generateOTP(6);

      // Get or create user
      let user = await usersService.getUserByPhone(phone);
      if (!user) {
        user = await usersService.createUser(phone, 'User');
      }

      // Create OTP session
      await usersService.createOTPSession(user.id, otp);

      // Send OTP via WhatsApp
      const message = `🔐 **Your Likelemba verification code**

Code: **${otp}**

This code expires in 10 minutes.

If you didn't request this, please ignore.`;

      await whatsappHandler.sendMessage(phone, message);

      console.log(`📱 OTP sent to ${phone}`);

      return { success: true, userId: user.id };
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(phone, otp) {
    try {
      const user = await usersService.getUserByPhone(phone);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      const isValid = await usersService.verifyOTP(user.id, otp);

      if (isValid) {
        // Update user last seen
        await query('UPDATE users SET last_seen_at = NOW() WHERE id = $1', [user.id]);

        return { success: true, user };
      } else {
        return { success: false, message: 'Invalid or expired OTP' };
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, message: 'Verification failed' };
    }
  }

  /**
   * Resend OTP
   */
  async resendOTP(phone) {
    try {
      const user = await usersService.getUserByPhone(phone);
      if (!user) {
        throw new Error('User not found');
      }

      return await this.sendOTP(phone, user.id);
    } catch (error) {
      console.error('Error resending OTP:', error);
      throw error;
    }
  }
}

module.exports = new OTPService();

