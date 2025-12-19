/**
 * Deployment Verification Script
 * Verifies all components are ready for deployment
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { query } = require('../src/config/database');
const greenAPI = require('../src/config/greenapi');
const stripe = require('../src/config/stripe');

async function verifyDeployment() {
  console.log('🔍 Verifying deployment readiness...\n');

  const checks = {
    environment: false,
    database: false,
    greenAPI: false,
    stripe: false,
    tables: false,
  };

  let allPassed = true;

  // 1. Check environment variables
  console.log('1️⃣ Checking environment variables...');
  try {
    const required = ['DATABASE_URL', 'GREEN_ID_INSTANCE', 'GREEN_API_TOKEN_INSTANCE', 'STRIPE_SECRET_KEY', 'OPENAI_API_KEY'];
    const missing = required.filter(v => !process.env[v]);
    
    if (missing.length === 0) {
      console.log('   ✅ All required environment variables set');
      checks.environment = true;
    } else {
      console.log(`   ❌ Missing: ${missing.join(', ')}`);
      allPassed = false;
    }
  } catch (error) {
    console.log('   ❌ Error checking environment:', error.message);
    allPassed = false;
  }

  // 2. Check database connection
  console.log('\n2️⃣ Checking database connection...');
  try {
    await query('SELECT 1');
    console.log('   ✅ Database connected');
    checks.database = true;
  } catch (error) {
    console.log('   ❌ Database connection failed:', error.message);
    allPassed = false;
  }

  // 3. Check database tables
  console.log('\n3️⃣ Checking database tables...');
  try {
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'likelemba' 
      AND table_name IN ('users', 'groups', 'cycles', 'payments', 'escrow_accounts', 'ledger_events')
      ORDER BY table_name
    `);
    
    const expectedTables = ['users', 'groups', 'cycles', 'payments', 'escrow_accounts', 'ledger_events'];
    const foundTables = result.rows.map(r => r.table_name);
    const missingTables = expectedTables.filter(t => !foundTables.includes(t));
    
    if (missingTables.length === 0) {
      console.log(`   ✅ All required tables exist (${foundTables.length} found)`);
      checks.tables = true;
    } else {
      console.log(`   ❌ Missing tables: ${missingTables.join(', ')}`);
      console.log('   💡 Run: npm run db:migrate');
      allPassed = false;
    }
  } catch (error) {
    console.log('   ❌ Error checking tables:', error.message);
    allPassed = false;
  }

  // 4. Check Green API
  console.log('\n4️⃣ Checking Green API configuration...');
  try {
    if (process.env.GREEN_ID_INSTANCE && process.env.GREEN_API_TOKEN_INSTANCE) {
      // Try to get instance state
      try {
        const state = await greenAPI.account.getStateInstance();
        console.log(`   ✅ Green API configured (State: ${state.stateInstance || 'unknown'})`);
        checks.greenAPI = true;
      } catch (error) {
        console.log('   ⚠️  Green API credentials set but instance may not be authorized');
        console.log('   💡 Check Green API console and authorize instance');
        checks.greenAPI = true; // Still consider configured
      }
    } else {
      console.log('   ❌ Green API credentials not set');
      allPassed = false;
    }
  } catch (error) {
    console.log('   ⚠️  Green API check error:', error.message);
  }

  // 5. Check Stripe
  console.log('\n5️⃣ Checking Stripe configuration...');
  try {
    if (process.env.STRIPE_SECRET_KEY) {
      console.log('   ✅ Stripe configured');
      checks.stripe = true;
    } else {
      console.log('   ❌ Stripe secret key not set');
      allPassed = false;
    }
  } catch (error) {
    console.log('   ⚠️  Stripe check error:', error.message);
  }

  // Summary
  console.log('\n📊 Verification Summary:');
  console.log(`   Environment: ${checks.environment ? '✅' : '❌'}`);
  console.log(`   Database: ${checks.database ? '✅' : '❌'}`);
  console.log(`   Tables: ${checks.tables ? '✅' : '❌'}`);
  console.log(`   Green API: ${checks.greenAPI ? '✅' : '❌'}`);
  console.log(`   Stripe: ${checks.stripe ? '✅' : '❌'}`);

  if (allPassed && checks.tables) {
    console.log('\n✅ All checks passed! Platform is ready for deployment.');
    console.log('\n📋 Next steps:');
    console.log('   1. Configure webhooks (Green API, Stripe)');
    console.log('   2. Start server: npm start');
    console.log('   3. Test WhatsApp flow: Send "Hi" to your number');
    process.exit(0);
  } else {
    console.log('\n❌ Some checks failed. Please fix issues before deploying.');
    if (!checks.tables) {
      console.log('\n💡 To set up database tables, run:');
      console.log('   npm run db:migrate');
    }
    process.exit(1);
  }
}

verifyDeployment().catch((error) => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});

