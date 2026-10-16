const { pool, query } = require('../config/database');
const { hashPassword, comparePassword, generateToken, revokeToken } = require('../services/auth.service');
const { AppError, mapDatabaseError } = require('../utils/error.utils');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Register a new user with default profile in a single transaction
 */
async function signup(request, reply) {
  const {
    name,
    email,
    password,
    birthYear,
    averageCycleLength,
    averagePeriodDuration,
  } = request.body || {};

  // 1. Validation
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return reply.status(400).send({
      status: 'error',
      message: 'Name is required and must be a valid string.',
    });
  }
  if (name.trim().length > 100) {
    return reply.status(400).send({
      status: 'error',
      message: 'Name cannot exceed 100 characters.',
    });
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return reply.status(400).send({
      status: 'error',
      message: 'A valid email address is required.',
    });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return reply.status(400).send({
      status: 'error',
      message: 'Password is required and must be at least 6 characters long.',
    });
  }

  if (birthYear !== undefined && birthYear !== null) {
    const by = Number(birthYear);
    if (!Number.isInteger(by) || by < 1900 || by > 2100) {
      return reply.status(400).send({
        status: 'error',
        message: 'Birth year must be an integer between 1900 and 2100.',
      });
    }
  }

  if (averageCycleLength !== undefined && averageCycleLength !== null) {
    const acl = Number(averageCycleLength);
    if (!Number.isInteger(acl) || acl < 15 || acl > 90) {
      return reply.status(400).send({
        status: 'error',
        message: 'Average cycle length must be an integer between 15 and 90 days.',
      });
    }
  }

  if (averagePeriodDuration !== undefined && averagePeriodDuration !== null) {
    const apd = Number(averagePeriodDuration);
    if (!Number.isInteger(apd) || apd < 1 || apd > 15) {
      return reply.status(400).send({
        status: 'error',
        message: 'Average period duration must be an integer between 1 and 15 days.',
      });
    }
  }

  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  // 2. Pre-check for duplicate email
  const existing = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
  if (existing.rows.length > 0) {
    return reply.status(409).send({
      status: 'error',
      message: 'An account with this email address already exists.',
    });
  }

  // 3. Hash password
  const hashedPassword = await hashPassword(password);

  // 4. Execute atomic transaction (users + user_profiles)
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userResult = await client.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at, updated_at`,
      [trimmedName, normalizedEmail, hashedPassword]
    );

    const newUser = userResult.rows[0];

    const profileResult = await client.query(
      `INSERT INTO user_profiles (
         user_id,
         birth_year,
         average_cycle_length,
         average_period_duration,
         onboarding_completed
       )
       VALUES ($1, $2, COALESCE($3, 28), COALESCE($4, 5), FALSE)
       RETURNING birth_year, average_cycle_length, average_period_duration, onboarding_completed, created_at, updated_at`,
      [
        newUser.id,
        birthYear !== undefined ? Number(birthYear) : null,
        averageCycleLength !== undefined ? Number(averageCycleLength) : null,
        averagePeriodDuration !== undefined ? Number(averagePeriodDuration) : null,
      ]
    );

    await client.query('COMMIT');

    const userProfile = profileResult.rows[0];
    const token = generateToken({ userId: String(newUser.id), email: newUser.email });

    return reply.status(201).send({
      status: 'success',
      message: 'Account created successfully.',
      data: {
        token,
        user: {
          id: String(newUser.id),
          name: newUser.name,
          email: newUser.email,
          created_at: newUser.created_at,
          profile: {
            birth_year: userProfile.birth_year,
            average_cycle_length: userProfile.average_cycle_length,
            average_period_duration: userProfile.average_period_duration,
            onboarding_completed: userProfile.onboarding_completed,
          },
        },
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    request.log.error(err, '[auth.controller] Signup transaction failed');
    const mapped = mapDatabaseError(err, {
      users_email_key: 'An account with this email address already exists.',
    });
    return reply.status(mapped.statusCode).send({
      status: 'error',
      message: mapped.message,
    });
  } finally {
    client.release();
  }
}

/**
 * Authenticate user with email and password
 */
async function login(request, reply) {
  const { email, password } = request.body || {};

  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return reply.status(400).send({
      status: 'error',
      message: 'Email and password are required.',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const userResult = await query(
      `SELECT u.id, u.name, u.email, u.password_hash, u.created_at,
              p.birth_year, p.average_cycle_length, p.average_period_duration, p.onboarding_completed
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.email = $1`,
      [normalizedEmail]
    );

    if (userResult.rows.length === 0) {
      return reply.status(401).send({
        status: 'error',
        message: 'Invalid email or password.',
      });
    }

    const user = userResult.rows[0];
    const passwordMatch = await comparePassword(password, user.password_hash);

    if (!passwordMatch) {
      return reply.status(401).send({
        status: 'error',
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken({ userId: String(user.id), email: user.email });

    return reply.status(200).send({
      status: 'success',
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: String(user.id),
          name: user.name,
          email: user.email,
          created_at: user.created_at,
          profile: {
            birth_year: user.birth_year,
            average_cycle_length: user.average_cycle_length,
            average_period_duration: user.average_period_duration,
            onboarding_completed: user.onboarding_completed,
          },
        },
      },
    });
  } catch (err) {
    request.log.error(err, '[auth.controller] Login failed');
    return reply.status(500).send({
      status: 'error',
      message: 'Internal error during login process.',
    });
  }
}

/**
 * Invalidate session token on server
 */
async function logout(request, reply) {
  if (request.token) {
    revokeToken(request.token);
  }

  return reply.status(200).send({
    status: 'success',
    message: 'Logged out successfully.',
  });
}

/**
 * Return current authenticated user and profile
 */
async function me(request, reply) {
  try {
    const result = await query(
      `SELECT u.id, u.name, u.email, u.created_at, u.updated_at,
              p.birth_year, p.average_cycle_length, p.average_period_duration, p.onboarding_completed
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [request.user.id]
    );

    if (result.rows.length === 0) {
      return reply.status(404).send({
        status: 'error',
        message: 'User profile not found.',
      });
    }

    const user = result.rows[0];

    return reply.status(200).send({
      status: 'success',
      data: {
        user: {
          id: String(user.id),
          name: user.name,
          email: user.email,
          created_at: user.created_at,
          updated_at: user.updated_at,
          profile: {
            birth_year: user.birth_year,
            average_cycle_length: user.average_cycle_length,
            average_period_duration: user.average_period_duration,
            onboarding_completed: user.onboarding_completed,
          },
        },
      },
    });
  } catch (err) {
    request.log.error(err, '[auth.controller] Failed to fetch current user');
    return reply.status(500).send({
      status: 'error',
      message: 'Internal error retrieving user information.',
    });
  }
}

module.exports = {
  signup,
  login,
  logout,
  me,
};
