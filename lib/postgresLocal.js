// lib/postgres.js - Local Development Only (No Neon)
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'marhaba_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  // Connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ PostgreSQL connection error:', {
      message: err.message,
      code: err.code,
    });
  } else {
    console.log('✅ PostgreSQL connected successfully to local database');
    release();
  }
});

// Event listeners
pool.on('connect', () => {
  console.log('✅ New client connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL error:', {
    message: err.message,
    code: err.code,
  });
});

// Query wrapper
export async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries (over 500ms)
    if (duration > 500) {
      console.warn(`Slow query (${duration}ms):`, { text: text.substring(0, 100), rows: res.rowCount });
    }
    
    return res;
  } catch (error) {
    console.error('Query error:', { 
      text: text.substring(0, 200),
      error: error.message,
      code: error.code 
    });
    throw error;
  }
}

// Get client for transactions
export async function getClient() {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);
  
  const timeout = setTimeout(() => {
    console.error('⚠️ A client has been checked out for more than 5 seconds');
  }, 5000);
  
  return {
    query: async (text, params) => {
      clearTimeout(timeout);
      try {
        return await query(text, params);
      } catch (error) {
        throw error;
      }
    },
    release: () => {
      clearTimeout(timeout);
      release();
    },
  };
}

// Health check function
export async function healthCheck() {
  try {
    const result = await pool.query('SELECT 1 as healthy, NOW() as time');
    return {
      healthy: true,
      timestamp: result.rows[0].time,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
    };
  }
}

export default pool;