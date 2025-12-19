/**
 * Payments API Routes
 */
const express = require('express');
const router = express.Router();
const paymentsService = require('../../services/payments');

// Get payment by ID
router.get('/:id', async (req, res) => {
  try {
    const payment = await paymentsService.getPaymentById(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json({ data: payment });
  } catch (error) {
    console.error('Error getting payment:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

