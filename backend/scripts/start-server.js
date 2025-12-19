/**
 * Server Startup Script
 * Starts the server with proper error handling and logging
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// Check environment first
const { execSync } = require('child_process');

console.log('🚀 Starting Likelemba server...\n');

try {
  // Check environment
  console.log('📋 Checking environment...');
  execSync('node scripts/check-env.js', { stdio: 'inherit' });
  console.log('');
} catch (error) {
  console.error('❌ Environment check failed. Please fix issues before starting.');
  process.exit(1);
}

// Test database connection
console.log('🔌 Testing database connection...');
const { query } = require('../src/config/database');
query('SELECT 1')
  .then(() => {
    console.log('✅ Database connected\n');
    startServer();
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error.message);
    console.error('💡 Please check your DATABASE_URL and ensure database is accessible');
    process.exit(1);
  });

function startServer() {
  console.log('🎯 Starting Express server...\n');
  
  // Import and start app
  const app = require('../src/app');
  
  // Server is started in app.js
  console.log('✅ Server startup complete!');
  console.log('📱 Ready to receive WhatsApp messages');
  console.log('🔗 Health check: http://localhost:' + (process.env.PORT || 3000) + '/health\n');
}

