require('dotenv').config();
const { checkConnection, closePool } = require('./src/config/database');

async function testConnection() {
  try {
    const result = await checkConnection();
    console.log('PostgreSQL connected successfully!');
    console.log({
      database: result.database,
      username: result.username,
      server_time: result.serverTime,
    });
    process.exitCode = 0;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exitCode = 1;
  } finally {
    await closePool().catch(() => {});
  }
}

testConnection();