const calendarController = require('../controllers/calendar.controller');
const { authenticate } = require('../middlewares/auth.middleware');

/**
 * Calendar route definition
 * @param {import('fastify').FastifyInstance} fastify
 */
async function calendarRoutes(fastify) {
  fastify.get('/calendar', { preHandler: [authenticate] }, calendarController.getCalendar);
}

module.exports = calendarRoutes;
