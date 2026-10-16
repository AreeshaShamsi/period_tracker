const { verifyToken } = require('../services/auth.service');
const { query } = require('../config/database');
const { AppError } = require('../utils/error.utils');

/**
 * Fastify preHandler hook to verify Bearer authentication token
 * and attach authenticated user to request.
 *
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
async function authenticate(request, reply) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.status(401).send({
      status: 'error',
      message: 'Authentication required. Missing or malformed Bearer token.',
    });
    return;
  }

  const token = authHeader.substring(7).trim();

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    if (err.name === 'TokenRevokedError') {
      reply.status(401).send({
        status: 'error',
        message: 'Token has been revoked. Please log in again.',
      });
      return;
    }
    reply.status(401).send({
      status: 'error',
      message: 'Invalid or expired authentication token.',
    });
    return;
  }

  // Load active user from database to ensure user still exists
  try {
    const userRes = await query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userRes.rows.length === 0) {
      reply.status(401).send({
        status: 'error',
        message: 'User account no longer exists.',
      });
      return;
    }

    const user = userRes.rows[0];
    request.user = {
      id: String(user.id),
      name: user.name,
      email: user.email,
      created_at: user.created_at,
    };
    request.token = token;
  } catch (err) {
    request.log.error(err, '[auth.middleware] Database error verifying user');
    reply.status(500).send({
      status: 'error',
      message: 'Internal error verifying authentication credentials.',
    });
  }
}

module.exports = {
  authenticate,
};
