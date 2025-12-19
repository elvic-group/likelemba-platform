/**
 * Authentication API Routes
 * OTP and authentication endpoints
 */
const express = require('express');
const router = express.Router();
const otpService = require('../../services/users/otp');
const { query } = require('../../config/database');

// Request OTP
router.post('/otp/request', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number required' });
    }

    const result = await otpService.sendOTP(phone);
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error requesting OTP:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify OTP
router.post('/otp/verify', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP required' });
    }

    const result = await otpService.verifyOTP(phone, otp);
    if (result.success) {
      res.json({ success: true, user: result.user });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: error.message });
  }
});

// Resend OTP
router.post('/otp/resend', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number required' });
    }

    const result = await otpService.resendOTP(phone);
    res.json({ success: true, message: 'OTP resent successfully' });
  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

