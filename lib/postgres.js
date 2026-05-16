// lib/postgres.js - Production Ready for Libyan Spider
import { Pool } from 'pg';

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Connection configuration
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'marhaba_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  // Connection pool settings
  max: parseInt(process.env.DB_POOL_MAX || '20'),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000'),
  // Important: No SSL for localhost connections (typical on shared hosting)
  ssl: false,
  // For remote connections, use:
  // ssl: isProduction ? { rejectUnauthorized: false } : false,
};

// For production, log connection info (without password)
if (isProduction) {
  console.log('📦 Connecting to PostgreSQL:', {
    host: poolConfig.host,
    port: poolConfig.port,
    database: poolConfig.database,
    user: poolConfig.user,
    ssl: poolConfig.ssl,
  });
}

const pool = new Pool(poolConfig);

// Test connection with better error handling
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ PostgreSQL connection error:', {
      message: err.message,
      code: err.code,
      host: poolConfig.host,
      database: poolConfig.database,
    });
    // Don't crash the app, just log the error
  } else {
    console.log('✅ PostgreSQL connected successfully to:', poolConfig.database);
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
      console.warn(`Slow query (${duration}ms):`, { text, rows: res.rowCount });
    }
    
    return res;
  } catch (error) {
    console.error('Query error:', { 
      text: text.substring(0, 200), // Don't log full huge queries
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