// lib/postgres.js - Updated for Neon (Cloud PostgreSQL)
import { Pool } from 'pg';

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Use DATABASE_URL for Neon (preferred) or fall back to individual variables
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Required for Neon
      // Connection pool settings
      max: parseInt(process.env.DB_POOL_MAX || '20'),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000'),
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'marhaba_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      ssl: false,
      max: parseInt(process.env.DB_POOL_MAX || '20'),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000'),
    };

// For production, log connection info (without password)
if (isProduction && !process.env.DATABASE_URL) {
  console.log('📦 Connecting to PostgreSQL:', {
    host: poolConfig.host,
    port: poolConfig.port,
    database: poolConfig.database,
    user: poolConfig.user,
    ssl: poolConfig.ssl,
  });
}

if (isProduction && process.env.DATABASE_URL) {
  // Log just the database name from the URL for privacy
  const dbNameMatch = process.env.DATABASE_URL.match(/\/([^?]+)/);
  console.log('📦 Connecting to Neon PostgreSQL:', {
    database: dbNameMatch ? dbNameMatch[1] : 'unknown',
    ssl: true,
  });
}

const pool = new Pool(poolConfig);

// Test connection with better error handling
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ PostgreSQL connection error:', {
      message: err.message,
      code: err.code,
    });
    // Don't crash the app, just log the error
  } else {
    console.log('✅ PostgreSQL connected successfully');
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

// Graceful shutdown for production
if (isProduction) {
  process.on('SIGINT', async () => {
    console.log('Closing PostgreSQL connection pool...');
    await pool.end();
    console.log('PostgreSQL pool closed');
    process.exit(0);
  });
}

// Query wrapper for production
export async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries in production (over 500ms)
    if (isProduction && duration > 500) {
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

// Health check function for monitoring
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