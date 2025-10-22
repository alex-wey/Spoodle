const { Client } = require('pg');

async function dropAndVerify() {
  const client = new Client({
    connectionString: 'postgresql://postgres:dogaspetiscute123@spoodle-database.cdae4aoagblz.us-east-2.rds.amazonaws.com:5432/spoodle-database?schema=public',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to AWS RDS\n');

    // DROP THE CONSTRAINT
    console.log('🔨 DROPPING pets_ownerId_fkey constraint...');
    await client.query('ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_ownerId_fkey CASCADE;');
    console.log('✅ DROP command executed\n');

    // IMMEDIATELY VERIFY IT'S GONE
    await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1 second

    console.log('🔍 VERIFYING constraint is gone...');
    const fkQuery = `
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'pets'
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name = 'pets_ownerId_fkey';
    `;
    
    const result = await client.query(fkQuery);
    
    if (result.rows.length === 0) {
      console.log('✅ CONFIRMED: Constraint is GONE!\n');
    } else {
      console.log('❌ PROBLEM: Constraint STILL EXISTS!');
      console.log(result.rows);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

dropAndVerify();

