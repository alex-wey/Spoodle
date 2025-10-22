const { Client } = require('pg');

async function getExactName() {
  const client = new Client({
    connectionString: 'postgresql://postgres:dogaspetiscute123@spoodle-database.cdae4aoagblz.us-east-2.rds.amazonaws.com:5432/spoodle-database?schema=public',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to AWS RDS\n');

    // Get EXACT constraint names (case-sensitive)
    console.log('🔍 EXACT CONSTRAINT NAMES ON PETS TABLE:');
    const result = await client.query(`
      SELECT conname as constraint_name
      FROM pg_constraint
      WHERE conrelid = 'pets'::regclass
      AND contype = 'f';
    `);
    
    console.log('Found constraints:');
    result.rows.forEach((row, i) => {
      console.log(`  ${i+1}. "${row.constraint_name}"`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

getExactName();

