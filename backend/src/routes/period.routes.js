const periodController = require('../controllers/period.controller');
const periodDayController = require('../controllers/periodDay.controller');
const { authenticate } = require('../middlewares/auth.middleware');

/**
 * Period and Period Day routes definition
 * @param {import('fastify').FastifyInstance} fastify
 */
async function periodRoutes(fastify) {
  // Period endpoints
  fastify.post('/periods', { preHandler: [authenticate] }, periodController.createPeriod);
  fastify.get('/periods', { preHandler: [authenticate] }, periodController.getPeriods);
  fastify.get('/periods/:id', { preHandler: [authenticate] }, periodController.getPeriodById);
  fastify.put('/periods/:id', { preHandler: [authenticate] }, periodController.updatePeriod);
  fastify.delete('/periods/:id', { preHandler: [authenticate] }, periodController.deletePeriod);

  // Daily flow log endpoints for period
  fastify.post('/periods/:id/days', { preHandler: [authenticate] }, periodDayController.createDayLog);
  fastify.get('/periods/:id/days', { preHandler: [authenticate] }, periodDayController.getDayLogs);
  fastify.put('/periods/:id/days/:dayLogId', { preHandler: [authenticate] }, periodDayController.updateDayLog);
  fastify.delete('/periods/:id/days/:dayLogId', { preHandler: [authenticate] }, periodDayController.deleteDayLog);
}

module.exports = periodRoutes;
