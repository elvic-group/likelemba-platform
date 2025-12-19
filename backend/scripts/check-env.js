/**
 * Environment Variables Checker
 * Verifies all required environment variables are set
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const requiredVars = {
  'DATABASE_URL': 'PostgreSQL connection string',
  'GREEN_ID_INSTANCE': 'Green API instance ID',
  'GREEN_API_TOKEN_INSTANCE': 'Green API token',
  'STRIPE_SECRET_KEY': 'Stripe secret key',
  'OPENAI_API_KEY': 'OpenAI API key (for AI Agent)',
};

const optionalVars = {
  'STRIPE_PUBLISHABLE_KEY': 'Stripe publishable key',
  'STRIPE_WEBHOOK_SECRET': 'Stripe webhook secret',
  'JWT_SECRET': 'JWT secret for authentication',
  'ADMIN_KEY': 'Admin API key',
  'PORT': 'Server port (default: 3000)',
  'NODE_ENV': 'Node environment (default: development)',
  'APP_URL': 'Application URL',
  'WEBHOOK_BASE_URL': 'Webhook base URL',
};

console.log('🔍 Checking environment variables...\n');

let allSet = true;
const missing = [];
const set = [];
const optionalSet = [];

// Check required variables
console.log('📋 Required Variables:');
for (const [varName, description] of Object.entries(requiredVars)) {
  if (process.env[varName]) {
    const value = process.env[varName];
    const masked = varName.includes('KEY') || varName.includes('SECRET') || varName.includes('TOKEN')
      ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
      : value;
    console.log(`   ✅ ${varName}: ${masked}`);
    set.push(varName);
  } else {
    console.log(`   ❌ ${varName}: MISSING - ${description}`);
    missing.push(varName);
    allSet = false;
  }
}

// Check optional variables
console.log('\n📋 Optional Variables:');
for (const [varName, description] of Object.entries(optionalVars)) {
  if (process.env[varName]) {
    const value = process.env[varName];
    const masked = varName.includes('KEY') || varName.includes('SECRET') || varName.includes('TOKEN')
      ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
      : value;
    console.log(`   ✅ ${varName}: ${masked}`);
    optionalSet.push(varName);
  } else {
    console.log(`   ⚠️  ${varName}: Not set - ${description}`);
  }
}

console.log('\n📊 Summary:');
console.log(`   Required: ${set.length}/${Object.keys(requiredVars).length} set`);
console.log(`   Optional: ${optionalSet.length}/${Object.keys(optionalVars).length} set`);

if (allSet) {
  console.log('\n✅ All required environment variables are set!');
  process.exit(0);
} else {
  console.log(`\n❌ Missing ${missing.length} required variable(s):`);
  missing.forEach(v => console.log(`   - ${v}`));
  console.log('\nPlease set these in your .env file');
  process.exit(1);
}

