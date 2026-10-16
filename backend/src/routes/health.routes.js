const { getHealth, getDbHealth } = require('../controllers/health.controller');

/**
 * Health check routes plugin
 * @param {import('fastify').FastifyInstance} fastify
 * @param {object} options
 */
async function healthRoutes(fastify, options) {
  fastify.get('/health', getHealth);
  fastify.get('/health/db', getDbHealth);
}

module.exports = healthRoutes;
