const { Client } = require('pg');

async function dropQuoted() {
  const client = new Client({
    connectionString: 'postgresql://postgres:dogaspetiscute123@spoodle-database.cdae4aoagblz.us-east-2.rds.amazonaws.com:5432/spoodle-database?schema=public',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to AWS RDS\n');

    console.log('🔨 DROPPING "pets_ownerId_fkey" with QUOTED identifier...');
    await client.query('ALTER TABLE pets DROP CONSTRAINT "pets_ownerId_fkey";');
    console.log('✅ DROP command executed\n');

    // Verify
    console.log('🔍 VERIFYING...');
    const result = await client.query(`
      SELECT conname as constraint_name
      FROM pg_constraint
      WHERE conrelid = 'pets'::regclass
      AND contype = 'f';
    `);
    
    if (result.rows.length === 0) {
      console.log('✅✅✅ SUCCESS! Constraint is GONE!');
    } else {
      console.log('❌ Still exists:');
      console.log(result.rows);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

dropQuoted();

