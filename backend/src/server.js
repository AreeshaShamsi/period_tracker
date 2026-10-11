require('dotenv').config();
const buildApp = require('./app');
const { checkConnection, closePool } = require('./config/database');

const PORT = parseInt(process.env.PORT, 10) || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const app = buildApp();

let isShuttingDown = false;

/**
 * Handle graceful shutdown
 * @param {string} signal - Signal received (SIGINT, SIGTERM)
 */
const shutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  app.log.info(`[server] Received ${signal}. Initiating graceful shutdown...`);

  try {
    // 1. Stop receiving incoming HTTP connections
    await app.close();
    app.log.info('[server] Fastify HTTP server closed.');

    // 2. Close PostgreSQL connection pool cleanly
    await closePool();
    app.log.info('[server] PostgreSQL connection pool closed.');

    process.exit(0);
  } catch (err) {
    app.log.error(`[server] Error during graceful shutdown: ${err.message}`);
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

/**
 * Verify DB connectivity and start the Fastify server
 */
const start = async () => {
  try {
    // 1. Verify PostgreSQL connectivity before listening
    app.log.info('[server] Verifying PostgreSQL connection...');
    const dbInfo = await checkConnection();
    app.log.info(
      `[server] PostgreSQL verified. Connected to database "${dbInfo.database}" as user "${dbInfo.username}".`
    );

    // 2. Start listening on configured host and port
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`[server] Lunari backend is running and listening on http://${HOST}:${PORT}`);
  } catch (error) {
    app.log.error(`[server] Startup failed: ${error.message}`);
    await closePool().catch(() => {});
    process.exit(1);
  }
};

start();
