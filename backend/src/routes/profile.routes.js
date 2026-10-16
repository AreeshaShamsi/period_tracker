const profileController = require('../controllers/profile.controller');
const { authenticate } = require('../middlewares/auth.middleware');

/**
 * Profile & notifications route definitions
 * @param {import('fastify').FastifyInstance} fastify
 */
async function profileRoutes(fastify) {
  fastify.get('/profile', { preHandler: [authenticate] }, profileController.getProfile);
  fastify.put('/profile', { preHandler: [authenticate] }, profileController.updateProfile);

  fastify.get(
    '/notifications/preferences',
    { preHandler: [authenticate] },
    profileController.getNotificationPreferences
  );
  fastify.put(
    '/notifications/preferences',
    { preHandler: [authenticate] },
    profileController.updateNotificationPreferences
  );
}

module.exports = profileRoutes;
