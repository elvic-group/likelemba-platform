/**
 * Cycles API Routes
 */
const express = require('express');
const router = express.Router();
const cyclesService = require('../../services/cycles');

// Get cycle by ID
router.get('/:id', async (req, res) => {
  try {
    const cycle = await cyclesService.getCycleById(req.params.id);
    if (!cycle) {
      return res.status(404).json({ error: 'Cycle not found' });
    }
    res.json({ data: cycle });
  } catch (error) {
    console.error('Error getting cycle:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

