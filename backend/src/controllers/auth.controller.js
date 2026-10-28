const { pool, query } = require('../config/database');
const { hashPassword, comparePassword, generateToken, revokeToken } = require('../services/auth.service');
const { AppError, mapDatabaseError } = require('../utils/error.utils');
const { validateSignup, validateLogin } = require('../validators/auth.validator');
const {
  verifyGoogleIdToken,
  verifyFirebaseIdToken,
  authenticateGoogleUser,
  linkGoogleAccount,
} = require('../services/googleAuth.service');

/**
 * Register a new user with default profile in a single transaction
 */
async function signup(request, reply) {
  // 1. Zod Schema Validation
  const validation = validateSignup(request.body || {});
  if (!validation.success) {
    return reply.status(400).send({
      status: 'error',
      message: validation.message,
    });
  }

  const {
    name,
    email,
    password,
    birthYear,
    averageCycleLength,
    averagePeriodDuration,
    idToken,
    firebaseIdToken,
  } = validation.data;

  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();
  const tokenToVerify = idToken || firebaseIdToken;

  let firebaseUid = null;
  if (tokenToVerify) {
    try {
      const decoded = await verifyFirebaseIdToken(tokenToVerify, { requireEmailVerified: false });
      if (decoded.email.toLowerCase() !== normalizedEmail) {
        return reply.status(400).send({
          status: 'error',
          code: 'EMAIL_MISMATCH',
          message: 'Firebase token email does not match signup email.',
        });
      }
      firebaseUid = decoded.uid;
    } catch (err) {
      const statusCode = err.statusCode || 401;
      return reply.status(statusCode).send({
        status: 'error',
        message: err.message || 'Firebase token verification failed.',
      });
    }
  }

  // 2. Pre-check for duplicate email or duplicate firebase_uid (case-insensitive)
  const existing = await query(
    'SELECT id FROM users WHERE LOWER(email) = LOWER($1) OR ($2::varchar IS NOT NULL AND firebase_uid = $2)',
    [normalizedEmail, firebaseUid]
  );
  if (existing.rows.length > 0) {
    return reply.status(409).send({
      status: 'error',
      message: 'An account with this email address already exists.',
    });
  }

  // 3. Hash password (if provided)
  const hashedPassword = password ? await hashPassword(password) : null;

  // 4. Execute atomic transaction (users + user_profiles)
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userResult = await client.query(
      `INSERT INTO users (name, email, password_hash, firebase_uid, auth_provider)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, firebase_uid, created_at, updated_at`,
      [trimmedName, normalizedEmail, hashedPassword, firebaseUid, firebaseUid ? 'firebase' : 'email']
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
    const isOnboarded = Boolean(userProfile.onboarding_completed);

    return reply.status(201).send({
      status: 'success',
      message: 'Account created successfully.',
      data: {
        token,
        user: {
          id: String(newUser.id),
          name: newUser.name,
          email: newUser.email,
          has_password: Boolean(hashedPassword),
          is_google_linked: false,
          firebase_uid: newUser.firebase_uid || null,
          auth_providers: ['email'],
          created_at: newUser.created_at,
          onboarding_completed: isOnboarded,
          onboardingCompleted: isOnboarded,
          profile: {
            birth_year: userProfile.birth_year,
            average_cycle_length: userProfile.average_cycle_length,
            average_period_duration: userProfile.average_period_duration,
            onboarding_completed: isOnboarded,
            onboardingCompleted: isOnboarded,
          },
        },
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    request.log.error(err, '[auth.controller] Signup transaction failed');
    const mapped = mapDatabaseError(err, {
      users_email_key: 'An account with this email address already exists.',
      users_firebase_uid_key: 'An account with this email address already exists.',
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
 * Authenticate user with email and password or verified Firebase ID token
 */
async function login(request, reply) {
  // 1. Zod Schema Validation
  const validation = validateLogin(request.body || {});
  if (!validation.success) {
    return reply.status(400).send({
      status: 'error',
      message: validation.message,
    });
  }

  const { email, password, idToken, firebaseIdToken } = validation.data;
  const normalizedEmail = email.trim().toLowerCase();
  const tokenToVerify = idToken || firebaseIdToken;

  try {
    let firebaseUid = null;
    if (tokenToVerify) {
      try {
        const decoded = await verifyFirebaseIdToken(tokenToVerify, { requireEmailVerified: false });
        if (decoded.email.toLowerCase() !== normalizedEmail) {
          return reply.status(401).send({
            status: 'error',
            message: 'Invalid email or password.',
          });
        }
        firebaseUid = decoded.uid;
      } catch (err) {
        return reply.status(401).send({
          status: 'error',
          message: 'Invalid email or password.',
        });
      }
    }

    const userResult = await query(
      `SELECT u.id, u.name, u.email, u.password_hash, u.google_id, u.firebase_uid, u.created_at,
              p.birth_year, p.average_cycle_length, p.average_period_duration, p.onboarding_completed
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE (u.firebase_uid IS NOT NULL AND u.firebase_uid = $1) OR LOWER(u.email) = LOWER($2)`,
      [firebaseUid, normalizedEmail]
    );

    if (userResult.rows.length === 0) {
      // First-time Firebase user logging in: safely create application user and default profile
      if (tokenToVerify && firebaseUid) {
        const client = await pool.connect();
        let newUser;
        let newProfile;
        try {
          await client.query('BEGIN');
          const insertUser = await client.query(
            `INSERT INTO users (name, email, firebase_uid, auth_provider, created_at, updated_at)
             VALUES ($1, $2, $3, 'firebase', NOW(), NOW())
             RETURNING id, name, email, firebase_uid, created_at`,
            [normalizedEmail.split('@')[0], normalizedEmail, firebaseUid]
          );
          newUser = insertUser.rows[0];
          const insertProfile = await client.query(
            `INSERT INTO user_profiles (user_id, average_cycle_length, average_period_duration, onboarding_completed, created_at, updated_at)
             VALUES ($1, 28, 5, FALSE, NOW(), NOW())
             RETURNING birth_year, average_cycle_length, average_period_duration, onboarding_completed`,
            [newUser.id]
          );
          newProfile = insertProfile.rows[0];
          await client.query('COMMIT');
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }

        const token = generateToken({ userId: String(newUser.id), email: newUser.email });
        return reply.status(200).send({
          status: 'success',
          message: 'Login successful.',
          data: {
            token,
            user: {
              id: String(newUser.id),
              name: newUser.name,
              email: newUser.email,
              has_password: false,
              is_google_linked: false,
              firebase_uid: newUser.firebase_uid,
              auth_providers: ['email'],
              created_at: newUser.created_at,
              onboarding_completed: false,
              onboardingCompleted: false,
              profile: {
                birth_year: newProfile.birth_year,
                average_cycle_length: newProfile.average_cycle_length,
                average_period_duration: newProfile.average_period_duration,
                onboarding_completed: false,
                onboardingCompleted: false,
              },
            },
          },
        });
      }

      return reply.status(401).send({
        status: 'error',
        message: 'Invalid email or password.',
      });
    }

    const user = userResult.rows[0];

    // If client logged in without an idToken and the user only has Google Sign-In
    if (!tokenToVerify && !user.password_hash) {
      return reply.status(400).send({
        status: 'error',
        code: 'GOOGLE_SIGN_IN_REQUIRED',
        message: 'This account was registered using Google Sign-In. Please sign in with Google.',
      });
    }

    // If client logged in without an idToken, check password hash
    if (!tokenToVerify) {
      const passwordMatch = await comparePassword(password, user.password_hash);
      if (!passwordMatch) {
        return reply.status(401).send({
          status: 'error',
          message: 'Invalid email or password.',
        });
      }
    } else {
      // If client logged in with a verified Firebase idToken:
      // Synchronize firebase_uid if not yet set
      if (firebaseUid && !user.firebase_uid) {
        await query('UPDATE users SET firebase_uid = $1 WHERE id = $2', [firebaseUid, user.id]);
        user.firebase_uid = firebaseUid;
      }
    }

    const token = generateToken({ userId: String(user.id), email: user.email });
    const isOnboarded = Boolean(user.onboarding_completed);

    const hasPassword = Boolean(user.password_hash);
    const isGoogleLinked = Boolean(user.google_id);
    const authProviders = [];
    if (hasPassword || user.firebase_uid) authProviders.push('email');
    if (isGoogleLinked) authProviders.push('google');

    return reply.status(200).send({
      status: 'success',
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: String(user.id),
          name: user.name,
          email: user.email,
          has_password: hasPassword,
          is_google_linked: isGoogleLinked,
          firebase_uid: user.firebase_uid || null,
          auth_providers: authProviders.length > 0 ? authProviders : ['email'],
          created_at: user.created_at,
          onboarding_completed: isOnboarded,
          onboardingCompleted: isOnboarded,
          profile: {
            birth_year: user.birth_year,
            average_cycle_length: user.average_cycle_length,
            average_period_duration: user.average_period_duration,
            onboarding_completed: isOnboarded,
            onboardingCompleted: isOnboarded,
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
      `SELECT u.id, u.name, u.email, u.password_hash, u.google_id, u.firebase_uid, u.created_at, u.updated_at,
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
    const hasPassword = Boolean(user.password_hash);
    const isGoogleLinked = Boolean(user.google_id);
    const authProviders = [];
    if (hasPassword || user.firebase_uid) authProviders.push('email');
    if (isGoogleLinked) authProviders.push('google');

    const isOnboarded = Boolean(user.onboarding_completed);

    return reply.status(200).send({
      status: 'success',
      data: {
        user: {
          id: String(user.id),
          name: user.name,
          email: user.email,
          has_password: hasPassword,
          is_google_linked: isGoogleLinked,
          firebase_uid: user.firebase_uid || null,
          auth_providers: authProviders.length > 0 ? authProviders : ['email'],
          created_at: user.created_at,
          updated_at: user.updated_at,
          onboarding_completed: isOnboarded,
          onboardingCompleted: isOnboarded,
          profile: {
            birth_year: user.birth_year,
            average_cycle_length: user.average_cycle_length,
            average_period_duration: user.average_period_duration,
            onboarding_completed: isOnboarded,
            onboardingCompleted: isOnboarded,
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

/**
 * Authenticate user with Firebase / Google ID token
 */
async function google(request, reply) {
  const { idToken, token, firebaseIdToken } = request.body || {};
  const tokenToVerify = idToken || firebaseIdToken || token;

  if (!tokenToVerify || typeof tokenToVerify !== 'string' || tokenToVerify.trim() === '') {
    return reply.status(401).send({
      status: 'error',
      message: 'Firebase ID token is required.',
    });
  }

  try {
    const googleProfile = await verifyGoogleIdToken(tokenToVerify);
    const authResult = await authenticateGoogleUser(googleProfile);

    return reply.status(200).send({
      status: 'success',
      message: 'Authenticated with Google successfully.',
      data: authResult,
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Firebase authentication failed.';
    request.log.error(err, '[auth.controller] Google auth failure');
    return reply.status(statusCode).send({
      status: 'error',
      ...(err.code ? { code: err.code } : {}),
      message,
    });
  }
}

/**
 * Securely link Google identity to existing authenticated user account
 */
async function linkGoogle(request, reply) {
  const { idToken, token, firebaseIdToken } = request.body || {};
  const tokenToVerify = idToken || firebaseIdToken || token;

  if (!tokenToVerify || typeof tokenToVerify !== 'string' || tokenToVerify.trim() === '') {
    return reply.status(400).send({
      status: 'error',
      message: 'Firebase ID token is required.',
    });
  }

  try {
    const googleProfile = await verifyGoogleIdToken(tokenToVerify);
    const linkedUser = await linkGoogleAccount({
      userId: request.user.id,
      googleProfile,
    });

    return reply.status(200).send({
      status: 'success',
      message: 'Google account linked successfully.',
      data: {
        user: linkedUser,
      },
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Failed to link Google account.';
    request.log.error(err, '[auth.controller] Google account linking failure');
    return reply.status(statusCode).send({
      status: 'error',
      ...(err.code ? { code: err.code } : {}),
      message,
    });
  }
}

module.exports = {
  signup,
  login,
  google,
  linkGoogle,
  logout,
  me,
};
