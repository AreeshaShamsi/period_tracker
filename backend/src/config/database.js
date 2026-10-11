require('dotenv').config();
const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn('[database] Warning: DATABASE_URL environment variable is not defined.');
}

// SSL Configuration: Local development runs without SSL.
// Cloud environments (Render, AWS RDS, Neon, etc.) can enable SSL via DATABASE_SSL=true or NODE_ENV=production.
// Note: Certificate verification is NOT disabled globally.
const isProduction = process.env.NODE_ENV === 'production';
const useSSL = process.env.DATABASE_SSL === 'true' || (isProduction && process.env.DATABASE_SSL !== 'false');

const poolConfig = {
  connectionString: databaseUrl,
};

if (useSSL) {
  poolConfig.ssl = {
    rejectUnauthorized: process.env.DB_REJECT_UNAUTHORIZED !== 'false',
  };
}

const pool = new Pool(poolConfig);

// Handle idle client errors without crashing the process
pool.on('error', (err) => {
  console.error('[database] Unexpected error on idle PostgreSQL client:', err.message);
});

/**
 * Execute a parameterized SQL query
 * @param {string} text - SQL statement
 * @param {Array} [params] - Parameterized values to prevent SQL injection
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = async (text, params) => {
  return pool.query(text, params);
};

/**
 * Reusable connectivity check for health checks and startup validation
 * @returns {Promise<{ database: string, username: string, serverTime: string }>}
 */
const checkConnection = async () => {
  const result = await pool.query(`
    SELECT
      current_database() AS database,
      current_user AS username,
      NOW() AS server_time;
  `);
  const row = result.rows[0];
  return {
    database: row.database,
    username: row.username,
    serverTime: row.server_time,
  };
};

/**
 * Gracefully close the PostgreSQL connection pool
 * @returns {Promise<void>}
 */
const closePool = async () => {
  try {
    await pool.end();
  } catch (err) {
    console.error('[database] Error during pool shutdown:', err.message);
    throw err;
  }
};

// Allow direct execution: `node src/config/database.js`
if (require.main === module) {
  (async () => {
    let success = false;
    try {
      console.log('Testing PostgreSQL connection...');
      const info = await checkConnection();
      console.log('PostgreSQL connected successfully!');
      console.log({
        database: info.database,
        username: info.username,
        server_time: info.serverTime,
      });
      success = true;
    } catch (error) {
      console.error('Database connection failed:', error.message);
      success = false;
    } finally {
      await closePool().catch(() => {});
      process.exit(success ? 0 : 1);
    }
  })();
}

module.exports = {
  pool,
  query,
  checkConnection,
  closePool,
};
