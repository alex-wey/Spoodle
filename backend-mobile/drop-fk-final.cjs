const { Client } = require('pg');

async function dropConstraint() {
  const client = new Client({
    connectionString: 'postgresql://postgres:dogaspetiscute123@spoodle-database.cdae4aoagblz.us-east-2.rds.amazonaws.com:5432/spoodle-database?schema=public',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to AWS RDS');

    // Check if constraint exists
    const checkQuery = `
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'pets' 
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name = 'pets_ownerId_fkey';
    `;
    
    const checkResult = await client.query(checkQuery);
    
    if (checkResult.rows.length > 0) {
      console.log('❌ Constraint pets_ownerId_fkey EXISTS - DROPPING IT NOW...');
      
      await client.query('ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_ownerId_fkey;');
      
      console.log('✅ Constraint dropped successfully!');
    } else {
      console.log('✅ Constraint does not exist - nothing to drop');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

dropConstraint();

