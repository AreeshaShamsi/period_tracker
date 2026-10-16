const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

/**
 * Authentication routes definition
 * @param {import('fastify').FastifyInstance} fastify
 */
async function authRoutes(fastify) {
  fastify.post('/auth/signup', authController.signup);
  fastify.post('/auth/login', authController.login);
  fastify.post('/auth/logout', { preHandler: [authenticate] }, authController.logout);
  fastify.get('/auth/me', { preHandler: [authenticate] }, authController.me);
}

module.exports = authRoutes;
