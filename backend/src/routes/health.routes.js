const { getHealth, getDbHealth } = require('../controllers/health.controller');

/**
 * Health check routes plugin
 * Registers /health and /health/db routes under the configured prefix (e.g., /api)
 *
 * @param {import('fastify').FastifyInstance} fastify - Fastify instance
 * @param {object} options - Plugin options
 */
async function healthRoutes(fastify, options) {
  fastify.get('/health', getHealth);
  fastify.get('/health/db', getDbHealth);
}

module.exports = healthRoutes;
