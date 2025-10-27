import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.MOBILE_DATABASE_URL,
  // Disable SSL for local development, enable for production (AWS RDS)
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false // Accept self-signed certificates from AWS RDS
  } : false
});

// Test connection on startup
pool.on('connect', () => {
  console.log('✅ PostgreSQL pool connected to AWS RDS');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on PostgreSQL client', err);
});

export default pool;

