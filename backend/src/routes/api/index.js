/**
 * API Routes
 * RESTful API endpoints for Likelemba platform
 */
const express = require('express');
const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api' });
});

// Groups API
router.use('/groups', require('./groups'));

// Users API
router.use('/users', require('./users'));

// Auth API
router.use('/auth', require('./auth'));

// Payments API
router.use('/payments', require('./payments'));

// Cycles API
router.use('/cycles', require('./cycles'));

// Disputes API
router.use('/disputes', require('./disputes'));

// Refunds API
router.use('/refunds', require('./refunds'));

// Admin API
router.use('/admin', require('./admin'));

module.exports = router;

