/**
 * Likelemba WhatsApp ROSCA Platform
 * Main Express Application Entry Point
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { query } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await query('SELECT 1');
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        greenAPI: process.env.GREEN_ID_INSTANCE ? 'configured' : 'not_configured',
        stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not_configured',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});

// Routes
app.use('/webhooks', require('./routes/webhooks'));
app.use('/api/v1', require('./routes/api'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Application error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start notification scheduler
const notificationScheduler = require('./services/notifications/scheduler');
if (process.env.NODE_ENV !== 'test') {
  notificationScheduler.start();
}

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Likelemba server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;

