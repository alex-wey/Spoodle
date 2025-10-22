import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a PostgreSQL connection pool that works with AWS RDS SSL
const pool = new Pool({
  connectionString: process.env.MOBILE_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Accept self-signed certificates from AWS RDS
  }
});

// Test connection on startup
pool.on('connect', () => {
  console.log('✅ PostgreSQL pool connected to AWS RDS');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on PostgreSQL client', err);
});

export default pool;

