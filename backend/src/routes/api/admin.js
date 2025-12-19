/**
 * Admin API Routes
 * Platform admin endpoints
 */
const express = require('express');
const router = express.Router();

// Middleware to check admin access
const checkAdmin = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  next();
};

router.use(checkAdmin);

// Admin health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'admin' });
});

module.exports = router;

