const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.MOBILE_DATABASE_URL,
  ssl: false
});

async function fixConstraint() {
  try {
    console.log('🔧 Connecting to database...\n');
    await client.connect();
    console.log('✅ Connected!\n');
    
    // Step 1: Drop the OLD constraint (pointing to pet_owners)
    console.log('🗑️  Dropping OLD constraint (pets_ownerId_fkey)...');
    await client.query('ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_ownerId_fkey;');
    console.log('✅ Old constraint dropped!\n');
    
    // Step 2: Create NEW constraint pointing to USERS table (for mobile app)
    console.log('🔗 Creating NEW constraint pointing to USERS table...');
    await client.query(`
      ALTER TABLE pets 
      ADD CONSTRAINT pets_ownerId_users_fkey 
      FOREIGN KEY ("ownerId") 
      REFERENCES users(id) 
      ON DELETE CASCADE;
    `);
    console.log('✅ New constraint created!\n');
    
    console.log('🎉 SUCCESS! Pets table now links to USERS table (mobile app)');
    console.log('📱 Mobile app users can now create pets!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await client.end();
  }
}

fixConstraint();

