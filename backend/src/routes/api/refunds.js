/**
 * Refunds API Routes
 */
const express = require('express');
const router = express.Router();
const refundsService = require('../../services/refunds');

// Get refund by ID
router.get('/:id', async (req, res) => {
  try {
    const refund = await refundsService.getRefundById(req.params.id);
    if (!refund) {
      return res.status(404).json({ error: 'Refund not found' });
    }
    res.json({ data: refund });
  } catch (error) {
    console.error('Error getting refund:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

