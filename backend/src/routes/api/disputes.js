/**
 * Disputes API Routes
 */
const express = require('express');
const router = express.Router();
const disputesService = require('../../services/disputes');

// Get dispute by ID
router.get('/:id', async (req, res) => {
  try {
    const dispute = await disputesService.getDisputeById(req.params.id);
    if (!dispute) {
      return res.status(404).json({ error: 'Dispute not found' });
    }
    res.json({ data: dispute });
  } catch (error) {
    console.error('Error getting dispute:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

