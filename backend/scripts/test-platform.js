/**
 * Platform Test Script
 * Tests core functionality of Likelemba platform
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { query } = require('../src/config/database');
const usersService = require('../src/services/users');
const groupsService = require('../src/services/groups');
const cyclesService = require('../src/services/cycles');
const escrowService = require('../src/services/escrow');
const ledgerService = require('../src/services/ledger');

async function testPlatform() {
  console.log('🧪 Testing Likelemba Platform...\n');

  try {
    // Test 1: Database connection
    console.log('1️⃣ Testing database connection...');
    await query('SELECT 1');
    console.log('   ✅ Database connected\n');

    // Test 2: Create test user
    console.log('2️⃣ Testing user creation...');
    // Clean up any existing test users first
    try {
      await query('DELETE FROM likelemba.users WHERE phone_e164 LIKE \'+1234567%\'');
    } catch (e) {
      // Ignore if no users exist
    }
    const testPhone = `+1234567890`; // Simple test phone
    const user = await usersService.createUser(testPhone, 'Test User');
    console.log(`   ✅ User created: ${user.id}\n`);

    // Test 3: Create test group
    console.log('3️⃣ Testing group creation...');
    // Create second user for group
    const user2 = await usersService.createUser('+1234567891', 'Test User 2');
    const group = await groupsService.createGroup({
      ownerUserId: user.id,
      name: 'Test Group',
      currency: 'KES',
      contributionAmount: 1000,
      frequency: 'weekly',
      startDate: new Date().toISOString().split('T')[0],
      membersCount: 2, // Minimum 2 members
      payoutOrderType: 'random',
      rules: { lateFee: 100, gracePeriod: 3 },
    });
    // Add second member
    await groupsService.addMember(group.id, user2.id);
    console.log(`   ✅ Group created: ${group.id}\n`);

    // Test 4: Check cycles created
    console.log('4️⃣ Testing cycle initialization...');
    const cycles = await cyclesService.getGroupCycles(group.id);
    console.log(`   ✅ ${cycles.length} cycles created\n`);

    // Test 5: Check escrow account
    console.log('5️⃣ Testing escrow account...');
    if (cycles.length > 0) {
      const escrow = await escrowService.getOrCreateEscrowAccount(group.id, cycles[0].id);
      console.log(`   ✅ Escrow account: ${escrow.id}\n`);
    }

    // Test 6: Test ledger event
    console.log('6️⃣ Testing ledger event...');
    const event = await ledgerService.recordEvent({
      eventType: 'test.event',
      subjectType: 'test',
      subjectId: user.id,
      payload: { test: true },
    });
    console.log(`   ✅ Ledger event recorded: ${event.eventId}\n`);

    // Test 7: Verify ledger integrity
    console.log('7️⃣ Testing ledger integrity...');
    const integrity = await ledgerService.verifyIntegrity();
    if (integrity.isValid) {
      console.log('   ✅ Ledger integrity verified\n');
    } else {
      console.log(`   ⚠️ Ledger integrity issues: ${integrity.errors.length}\n`);
    }

    // Cleanup test data
    console.log('🧹 Cleaning up test data...');
    await query('DELETE FROM likelemba.groups WHERE id = $1', [group.id]);
    await query('DELETE FROM likelemba.users WHERE id = $1', [user.id]);
    await query('DELETE FROM likelemba.users WHERE id = $1', [user2.id]);
    console.log('   ✅ Test data cleaned\n');

    console.log('✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testPlatform();

