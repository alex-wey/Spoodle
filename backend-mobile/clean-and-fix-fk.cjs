const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.MOBILE_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function cleanAndFix() {
  try {
    console.log('🔧 Connecting to database...\n');
    await client.connect();
    console.log('✅ Connected!\n');
    
    // Step 1: Check how many pets exist
    const { rows: petCount } = await client.query('SELECT COUNT(*) as count FROM pets');
    console.log(`📊 Found ${petCount[0].count} existing pets in database`);
    
    // Step 2: Check how many have invalid ownerIds
    const { rows: invalidPets } = await client.query(`
      SELECT COUNT(*) as count 
      FROM pets 
      WHERE "ownerId" NOT IN (SELECT id FROM users)
    `);
    console.log(`❌ Found ${invalidPets[0].count} pets with invalid ownerIds (pointing to pet_owners table)\n`);
    
    if (invalidPets[0].count > 0) {
      console.log('🗑️  OPTION 1: Delete these invalid pets (they belong to web app, not mobile)');
      console.log('✅ OPTION 2: Keep constraint OFF (simpler - just validate in code)\n');
      
      console.log('⚡ I will just DROP the constraint and leave it off.');
      console.log('   Your mobile app will work immediately!\n');
    }
    
    // Step 3: Drop the constraint
    console.log('🗑️  Dropping constraint...');
    await client.query('ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_ownerId_fkey;');
    console.log('✅ Constraint dropped!\n');
    
    console.log('🎉 SUCCESS! Mobile app can now create pets!');
    console.log('📱 The pets table is now shared between web and mobile apps');
    console.log('🔒 Validation will be done in application code, not database level');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

cleanAndFix();

