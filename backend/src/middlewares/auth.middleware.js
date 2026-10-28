const { pool, query } = require('../config/database');
const { verifyToken } = require('../services/auth.service');
const { isFirebaseConfigured } = require('../config/firebase');
const { verifyFirebaseIdToken } = require('../services/googleAuth.service');
const { AppError } = require('../utils/error.utils');

/**
 * Fastify preHandler hook to verify Bearer authentication token
 * and attach authenticated user to request.
 *
 * Supports both:
 * 1. Verified Firebase ID tokens (verified using Firebase Admin SDK)
 * 2. Local session JWT tokens (for backwards compatibility with tests)
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
  if (!token) {
    reply.status(401).send({
      status: 'error',
      message: 'Authentication required. Missing or malformed Bearer token.',
    });
    return;
  }

  // 1. Try local session JWT first (issued by Lunari backend)
  let localDecoded = null;
  try {
    localDecoded = verifyToken(token);
  } catch (err) {
    if (err.name === 'TokenRevokedError') {
      reply.status(401).send({
        status: 'error',
        message: 'Token has been revoked. Please log in again.',
      });
      return;
    }
  }

  if (localDecoded && localDecoded.userId) {
    // Verified local JWT session token!
    try {
      const userRes = await query(
        'SELECT id, name, email, firebase_uid, created_at FROM users WHERE id = $1',
        [localDecoded.userId]
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
        firebase_uid: user.firebase_uid,
        created_at: user.created_at,
      };
      request.token = token;
      return;
    } catch (err) {
      request.log.error(err, '[auth.middleware] Database error verifying user');
      reply.status(500).send({
        status: 'error',
        message: 'Internal error verifying authentication credentials.',
      });
      return;
    }
  }

  // 2. Not a local session JWT: Verify as Firebase ID token using Firebase Admin SDK
  if (isFirebaseConfigured()) {
    try {
      const firebaseUser = await verifyFirebaseIdToken(token, { requireEmailVerified: false });
      if (firebaseUser && firebaseUser.uid) {
        // Authenticated with Firebase! Authorize access to PostgreSQL records
        let userRes = await query(
          'SELECT id, name, email, firebase_uid, created_at FROM users WHERE firebase_uid = $1',
          [firebaseUser.uid]
        );

        // If not found by firebase_uid, handle first-time Firebase user or email linking
        if (userRes.rows.length === 0) {
          const cleanEmail = String(firebaseUser.email).toLowerCase().trim();
          const emailCheck = await query(
            'SELECT id, name, email, password_hash, firebase_uid, created_at FROM users WHERE LOWER(email) = LOWER($1)',
            [cleanEmail]
          );

          if (emailCheck.rows.length > 0) {
            const existingUser = emailCheck.rows[0];
            if (!existingUser.firebase_uid) {
              await query('UPDATE users SET firebase_uid = $1 WHERE id = $2', [firebaseUser.uid, existingUser.id]);
              existingUser.firebase_uid = firebaseUser.uid;
            }
            userRes = { rows: [existingUser] };
          } else {
            // Genuinely new Firebase user: create PostgreSQL user and user_profiles atomically
            const client = await pool.connect();
            try {
              await client.query('BEGIN');
              const insertUser = await client.query(
                `INSERT INTO users (name, email, firebase_uid, auth_provider, created_at, updated_at)
                 VALUES ($1, $2, $3, 'firebase', NOW(), NOW())
                 RETURNING id, name, email, firebase_uid, created_at`,
                [firebaseUser.name || cleanEmail.split('@')[0], cleanEmail, firebaseUser.uid]
              );
              const newUser = insertUser.rows[0];
              await client.query(
                `INSERT INTO user_profiles (user_id, average_cycle_length, average_period_duration, onboarding_completed, created_at, updated_at)
                 VALUES ($1, 28, 5, FALSE, NOW(), NOW())`,
                [newUser.id]
              );
              await client.query('COMMIT');
              userRes = { rows: [newUser] };
            } catch (createErr) {
              await client.query('ROLLBACK');
              request.log.error(createErr, '[auth.middleware] Failed creating profile for new Firebase user');
              throw createErr;
            } finally {
              client.release();
            }
          }
        }

        const user = userRes.rows[0];
        request.user = {
          id: String(user.id),
          name: user.name,
          email: user.email,
          firebase_uid: user.firebase_uid,
          created_at: user.created_at,
        };
        request.token = token;
        return;
      }
    } catch (fbErr) {
      request.log.debug({ err: fbErr.message }, '[auth.middleware] Firebase token verification failed');
    }
  }

  // 3. Both local JWT and Firebase ID token verifications failed
  reply.status(401).send({
    status: 'error',
    message: 'Invalid or expired authentication token.',
  });
}

module.exports = {
  authenticate,
};
