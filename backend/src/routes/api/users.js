/**
 * Users API Routes
 */
const express = require('express');
const router = express.Router();
const usersService = require('../../services/users');

// Get user by phone
router.get('/by-phone/:phone', async (req, res) => {
  try {
    const user = await usersService.getUserByPhone(req.params.phone);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ data: user });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

