const { checkConnection } = require('../config/database');

/**
 * Basic API health check
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
const getHealth = async (request, reply) => {
  return reply.status(200).send({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};

/**
 * Database connectivity health check
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
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
    request.log.error(error, '[health.controller] Database health check failed');
    return reply.status(503).send({
      status: 'error',
      database: {
        connected: false,
        error: 'Database connection unavailable',
      },
    });
  }
};

module.exports = {
  getHealth,
  getDbHealth,
};
