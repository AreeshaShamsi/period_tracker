const Fastify = require('fastify');
const cors = require('@fastify/cors');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const periodRoutes = require('./routes/period.routes');
const symptomRoutes = require('./routes/symptom.routes');
const cycleRoutes = require('./routes/cycle.routes');
const calendarRoutes = require('./routes/calendar.routes');

const DEV_DEFAULT_ORIGINS = [
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  'http://localhost:19006',
  'http://127.0.0.1:19006',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
];

/**
 * Resolves the allowed origins list based on environment
 * @param {boolean} isProduction
 * @returns {string[]}
 */
function resolveAllowedOrigins(isProduction) {
  const envOrigins = (process.env.CORS_ORIGIN || process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (isProduction) {
    return envOrigins;
  }

  return Array.from(new Set([...DEV_DEFAULT_ORIGINS, ...envOrigins]));
}

/**
 * Fastify application factory
 * @param {object} [options={}] - Custom Fastify options (e.g. for testing)
 * @returns {import('fastify').FastifyInstance}
 */
function buildApp(options = {}) {
  const isProduction = process.env.NODE_ENV === 'production';
  const allowedOrigins = resolveAllowedOrigins(isProduction);

  const fastify = Fastify({
    logger: options.logger ?? {
      level: isProduction ? 'warn' : 'info',
      // Redact sensitive headers if logging headers
      redact: ['req.headers.authorization', 'req.headers.cookie'],
    },
    ...options,
  });

  // Register CORS before registering routes or starting the server
  fastify.register(cors, {
    origin: (origin, cb) => {
      // Allow requests with no origin (e.g. native mobile apps, curl, server-to-server)
      if (!origin) {
        return cb(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return cb(null, true);
      }

      // In non-production, also allow other localhost/127.0.0.1 ports (for Expo web fallback ports)
      // and local LAN IP ranges for mobile testing over local Wi-Fi
      if (!isProduction) {
        const isLocalHost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
        const isLocalNetwork = /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(origin);
        if (isLocalHost || isLocalNetwork) {
          return cb(null, true);
        }
      }

      return cb(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: false,
    preflight: true,
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
