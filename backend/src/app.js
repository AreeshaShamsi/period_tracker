const Fastify = require('fastify');
const cors = require('@fastify/cors');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const periodRoutes = require('./routes/period.routes');
const symptomRoutes = require('./routes/symptom.routes');
const cycleRoutes = require('./routes/cycle.routes');
const calendarRoutes = require('./routes/calendar.routes');

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

  // Enable CORS for local Expo / React Native development and web preview
  fastify.register(cors, {
    origin: (origin, cb) => {
      // Allow mobile apps (no origin), localhost, and local dev network
      if (!origin || /localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+/.test(origin)) {
        cb(null, true);
        return;
      }
      cb(null, true); // Permissive in dev mode for Expo mobile clients
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
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

  // Register modular routes with /api prefix
  fastify.register(healthRoutes, { prefix: '/api' });
  fastify.register(authRoutes, { prefix: '/api' });
  fastify.register(profileRoutes, { prefix: '/api' });
  fastify.register(periodRoutes, { prefix: '/api' });
  fastify.register(symptomRoutes, { prefix: '/api' });
  fastify.register(cycleRoutes, { prefix: '/api' });
  fastify.register(calendarRoutes, { prefix: '/api' });

  return fastify;
}

module.exports = buildApp;
