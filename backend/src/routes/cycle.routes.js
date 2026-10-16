const cycleController = require('../controllers/cycle.controller');
const { authenticate } = require('../middlewares/auth.middleware');

/**
 * Cycle route definition
 * @param {import('fastify').FastifyInstance} fastify
 */
async function cycleRoutes(fastify) {
  fastify.get('/cycle', { preHandler: [authenticate] }, cycleController.getCycle);
}

module.exports = cycleRoutes;
