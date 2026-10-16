const symptomController = require('../controllers/symptom.controller');
const { authenticate } = require('../middlewares/auth.middleware');

/**
 * Symptom route definitions
 * @param {import('fastify').FastifyInstance} fastify
 */
async function symptomRoutes(fastify) {
  fastify.post('/symptoms', { preHandler: [authenticate] }, symptomController.createSymptom);
  fastify.get('/symptoms', { preHandler: [authenticate] }, symptomController.getSymptoms);
  fastify.put('/symptoms/:id', { preHandler: [authenticate] }, symptomController.updateSymptom);
  fastify.delete('/symptoms/:id', { preHandler: [authenticate] }, symptomController.deleteSymptom);
}

module.exports = symptomRoutes;
