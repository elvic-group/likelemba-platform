/**
 * Set Stripe Webhook Secret
 * Helper script to add STRIPE_WEBHOOK_SECRET to .env file
 */
const fs = require('fs');
const path = require('path');

const webhookSecret = 'whsec_EtvFqVtmB37b1Ghns070eYMZ9Gp8mNg';
const envPath = path.resolve(__dirname, '../../.env');

console.log('🔐 Setting Stripe Webhook Secret...\n');

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env file not found. Creating new .env file...');
  fs.writeFileSync(envPath, `STRIPE_WEBHOOK_SECRET=${webhookSecret}\n`);
  console.log('✅ Created .env file with STRIPE_WEBHOOK_SECRET');
} else {
  // Read existing .env file
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check if STRIPE_WEBHOOK_SECRET already exists
  if (envContent.includes('STRIPE_WEBHOOK_SECRET=')) {
    // Update existing value
    envContent = envContent.replace(
      /STRIPE_WEBHOOK_SECRET=.*/g,
      `STRIPE_WEBHOOK_SECRET=${webhookSecret}`
    );
    console.log('✅ Updated existing STRIPE_WEBHOOK_SECRET in .env');
  } else {
    // Add new line
    envContent += `\nSTRIPE_WEBHOOK_SECRET=${webhookSecret}\n`;
    console.log('✅ Added STRIPE_WEBHOOK_SECRET to .env');
  }
  
  // Write back to file
  fs.writeFileSync(envPath, envContent);
}

console.log('\n✅ Stripe Webhook Secret configured!');
console.log(`   Secret: ${webhookSecret.substring(0, 12)}...${webhookSecret.substring(webhookSecret.length - 4)}`);
console.log('\n📝 Next steps:');
console.log('   1. Restart your server if it\'s running');
console.log('   2. Test the webhook endpoint');
console.log('   3. Verify webhook events are being received');


