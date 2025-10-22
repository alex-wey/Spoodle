const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.MOBILE_DATABASE_URL,
  ssl: false  // Disable SSL to avoid certificate issues
});

async function dropConstraint() {
  try {
    console.log('🔧 Connecting to database...\n');
    await client.connect();
    console.log('✅ Connected!\n');
    
    console.log('🔧 Dropping foreign key constraint pets_ownerId_fkey...\n');
    await client.query('ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_ownerId_fkey;');
    
    console.log('✅ Constraint dropped successfully!\n');
    console.log('Now you can create pets!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

dropConstraint();

