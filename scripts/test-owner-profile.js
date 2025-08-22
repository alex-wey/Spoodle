#!/usr/bin/env node

/**
 * Test script for owner profile functionality
 * Tests the owner API endpoints and verifies data flow
 */

const API_BASE = 'http://localhost:3007';

async function testOwnerProfile() {
  console.log('🧪 Testing Owner Profile Functionality...\n');

  try {
    // Test 1: Get owner by email
    console.log('1️⃣ Testing: Get owner by email');
    const emailResponse = await fetch(`${API_BASE}/api/owners/email/sarah.johnson@email.com`);
    const emailData = await emailResponse.json();
    
    if (emailData.success) {
      console.log('✅ Owner found by email:', emailData.data.name);
      console.log('   - Phone:', emailData.data.phone);
      console.log('   - Address:', emailData.data.address);
      console.log('   - Pets count:', emailData.data.pets.length);
    } else {
      console.log('❌ Failed to get owner by email:', emailData.error);
    }

    // Test 2: Get owner by ID
    console.log('\n2️⃣ Testing: Get owner by ID');
    const idResponse = await fetch(`${API_BASE}/api/owners/2`);
    const idData = await idResponse.json();
    
    if (idData.success) {
      console.log('✅ Owner found by ID:', idData.data.name);
      console.log('   - Emergency contact:', idData.data.emergencyContact?.name);
      console.log('   - Preferences:', idData.data.preferences?.communicationMethod);
    } else {
      console.log('❌ Failed to get owner by ID:', idData.error);
    }

    // Test 3: Get owner's pets
    console.log('\n3️⃣ Testing: Get owner\'s pets');
    const petsResponse = await fetch(`${API_BASE}/api/owners/2/pets`);
    const petsData = await petsResponse.json();
    
    if (petsData.success) {
      console.log('✅ Owner\'s pets retrieved:', petsData.data.length, 'pets');
      petsData.data.forEach(pet => {
        console.log(`   - ${pet.name} (${pet.breed}) - ${pet.complianceStatus}`);
      });
    } else {
      console.log('❌ Failed to get owner\'s pets:', petsData.error);
    }

    // Test 4: Test non-existent owner
    console.log('\n4️⃣ Testing: Non-existent owner');
    const notFoundResponse = await fetch(`${API_BASE}/api/owners/999`);
    const notFoundData = await notFoundResponse.json();
    
    if (!notFoundData.success) {
      console.log('✅ Correctly handled non-existent owner:', notFoundData.error);
    } else {
      console.log('❌ Should have failed for non-existent owner');
    }

    console.log('\n🎉 Owner profile functionality test completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Navigate to a pet profile in the 3pi app');
    console.log('   2. Click "View Owner Profile" button');
    console.log('   3. Verify the owner profile page loads correctly');
    console.log('   4. Test navigation between tabs (Overview, Pets, Preferences)');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('\n💡 Make sure the API server is running on port 3007');
  }
}

// Run the test
testOwnerProfile();
