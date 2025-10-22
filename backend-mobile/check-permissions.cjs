const { Client } = require('pg');

async function checkPermissions() {
  const client = new Client({
    connectionString: 'postgresql://postgres:dogaspetiscute123@spoodle-database.cdae4aoagblz.us-east-2.rds.amazonaws.com:5432/spoodle-database?schema=public',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to AWS RDS\n');

    // Check current user
    console.log('🔍 CURRENT DATABASE USER:');
    const userResult = await client.query('SELECT current_user, current_database();');
    console.log(userResult.rows[0]);
    console.log();

    // Check table owner
    console.log('🔍 PETS TABLE OWNER:');
    const ownerResult = await client.query(`
      SELECT tableowner 
      FROM pg_tables 
      WHERE tablename = 'pets';
    `);
    console.log(ownerResult.rows[0]);
    console.log();

    // Check our privileges on pets table
    console.log('🔍 OUR PRIVILEGES ON PETS TABLE:');
    const privResult = await client.query(`
      SELECT grantee, privilege_type
      FROM information_schema.role_table_grants
      WHERE table_name = 'pets'
      AND grantee = current_user;
    `);
    console.log(privResult.rows);
    console.log();

    // Try to actually drop it with explicit ALTER TABLE
    console.log('🔨 ATTEMPTING TO DROP CONSTRAINT (with output):');
    try {
      const dropResult = await client.query(`
        ALTER TABLE pets 
        DROP CONSTRAINT pets_ownerId_fkey;
      `);
      console.log('Drop result:', dropResult);
    } catch (dropError) {
      console.error('❌ DROP FAILED:');
      console.error('  Code:', dropError.code);
      console.error('  Message:', dropError.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

checkPermissions();

