const Fastify = require('fastify');
const healthRoutes = require('./routes/health.routes');

/**
 * Fastify application factory
 * @param {object} [options={}] - Custom Fastify options (e.g. for testing)
 * @returns {import('fastify').FastifyInstance}
 */
function buildApp(options = {}) {
  const isProduction = process.env.NODE_ENV === 'production';

  const fastify = Fastify({
    logger: options.logger ?? {
      level: isProduction ? 'warn' : 'info',
      // Redact sensitive headers if logging headers
      redact: ['req.headers.authorization', 'req.headers.cookie'],
    },
    ...options,
  });

  // Centralized Error Handler
  fastify.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    const statusCode = error.statusCode || 500;
    reply.status(statusCode).send({
      status: 'error',
      message: statusCode >= 500 ? 'Internal Server Error' : error.message,
    });
  });

  // Centralized 404 Not Found Handler
  fastify.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      status: 'error',
      message: `Route ${request.method} ${request.url} not found`,
    });
  });

  // Preserved root route
  fastify.get('/', async () => {
    return {
      message: 'Lunari backend is running',
    };
  });

  // Register modular routes
  fastify.register(healthRoutes, { prefix: '/api' });

  return fastify;
}

module.exports = buildApp;
