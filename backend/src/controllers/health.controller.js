const { checkConnection } = require('../config/database');

/**
 * Basic API health check
 * GET /api/health
 */
const getHealth = async (request, reply) => {
  return reply.status(200).send({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};

/**
 * PostgreSQL database connectivity health check
 * GET /api/health/db
 */
const getDbHealth = async (request, reply) => {
  try {
    const dbInfo = await checkConnection();
    return reply.status(200).send({
      status: 'ok',
      database: {
        connected: true,
        name: dbInfo.database,
        user: dbInfo.username,
        server_time: dbInfo.serverTime,
      },
    });
  } catch (error) {
    // Log the error internally without exposing details to client
    request.log.error(`[health] Database connectivity check failed: ${error.message}`);
    return reply.status(503).send({
      status: 'error',
      database: {
        connected: false,
        message: 'Database service unavailable',
      },
    });
  }
};

module.exports = {
  getHealth,
  getDbHealth,
};
