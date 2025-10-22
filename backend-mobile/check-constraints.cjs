const { Client } = require('pg');

async function checkEverything() {
  const client = new Client({
    connectionString: 'postgresql://postgres:dogaspetiscute123@spoodle-database.cdae4aoagblz.us-east-2.rds.amazonaws.com:5432/spoodle-database?schema=public',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to AWS RDS\n');

    // Check ALL foreign key constraints on pets table
    console.log('🔍 ALL FOREIGN KEY CONSTRAINTS ON PETS TABLE:');
    const fkQuery = `
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = 'pets';
    `;
    
    const fkResult = await client.query(fkQuery);
    console.log(fkResult.rows);
    console.log();

    // Check all triggers on pets table
    console.log('🔍 ALL TRIGGERS ON PETS TABLE:');
    const triggerQuery = `
      SELECT trigger_name, event_manipulation, action_statement
      FROM information_schema.triggers
      WHERE event_object_table = 'pets';
    `;
    
    const triggerResult = await client.query(triggerQuery);
    console.log(triggerResult.rows);
    console.log();

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkEverything();

