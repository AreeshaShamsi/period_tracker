const { OAuth2Client } = require('google-auth-library');
const { pool, query } = require('../config/database');
const { generateToken } = require('./auth.service');

let client = new OAuth2Client();

/**
 * For testing purposes: set mock OAuth2Client instance
 * @param {OAuth2Client} customClient
 */
function _setOAuth2Client(customClient) {
  client = customClient;
}

/**
 * Retrieve list of configured Google OAuth client IDs from environment.
 * Primary keys:
 * - GOOGLE_CLIENT_ID_WEB
 * - GOOGLE_CLIENT_ID_ANDROID
 * @returns {string[]}
 */
function getAllowedClientIds() {
  const ids = [];
  if (process.env.GOOGLE_CLIENT_ID_WEB) {
    const webId = process.env.GOOGLE_CLIENT_ID_WEB.trim();
    if (webId) ids.push(webId);
  }
  if (process.env.GOOGLE_CLIENT_ID_ANDROID) {
    const androidId = process.env.GOOGLE_CLIENT_ID_ANDROID.trim();
    if (androidId) ids.push(androidId);
  }
  return ids;
}

/**
 * Verify Google ID token using Google's official verification library.
 * Validates:
 * - Signature (via Google public certs)
 * - Expiration (exp claim)
 * - Issuer (accounts.google.com or https://accounts.google.com)
 * - Audience (must match configured Web or Android Client IDs)
 * - Verified email claim (email_verified === true)
 * - Non-empty subject identifier (sub claim)
 * - Non-empty email claim
 *
 * Rejects missing, malformed, expired, invalid, unverified, or incorrectly issued tokens with 401.
 * Fails safely with 500 if client IDs are unconfigured on the server (never bypasses).
 *
 * @param {string} idToken
 * @param {string[]} [overrideAudiences]
 * @returns {Promise<{ sub: string, email: string, name: string, picture?: string }>}
 */
async function verifyGoogleIdToken(idToken, overrideAudiences = null) {
  if (!idToken || typeof idToken !== 'string' || idToken.trim() === '') {
    const error = new Error('Google ID token is required.');
    error.statusCode = 401;
    throw error;
  }

  const allowedAudiences = overrideAudiences || getAllowedClientIds();

  if (!allowedAudiences || allowedAudiences.length === 0) {
    const error = new Error(
      'No Google OAuth client IDs configured on server. Please configure GOOGLE_CLIENT_ID_WEB or GOOGLE_CLIENT_ID_ANDROID.'
    );
    error.statusCode = 500;
    throw error;
  }

  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken,
      audience: allowedAudiences,
    });
  } catch (err) {
    const error = new Error(`Google ID token verification failed: ${err.message}`);
    error.statusCode = 401;
    throw error;
  }

  const payload = ticket.getPayload();
  if (!payload) {
    const error = new Error('Invalid Google ID token payload.');
    error.statusCode = 401;
    throw error;
  }

  // 1. Issuer verification (must match Google's official auth issuers)
  const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
  if (!payload.iss || !validIssuers.includes(payload.iss)) {
    const error = new Error(`Invalid token issuer: ${payload.iss}`);
    error.statusCode = 401;
    throw error;
  }

  // 2. Audience verification (must match trusted client IDs)
  const tokenAudiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  const hasValidAud = tokenAudiences.some((aud) => allowedAudiences.includes(aud));
  if (!hasValidAud) {
    const error = new Error(`Token audience not authorized: ${payload.aud}`);
    error.statusCode = 401;
    throw error;
  }

  // 3. Expiration verification
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    const error = new Error('Google ID token has expired.');
    error.statusCode = 401;
    throw error;
  }

  // 4. Verified email claim (protects against unverified account takeover)
  const isEmailVerified = payload.email_verified === true || payload.email_verified === 'true';
  if (!isEmailVerified) {
    const error = new Error('Google account email is not verified.');
    error.statusCode = 401;
    throw error;
  }

  // 5. Stable, non-empty sub claim
  if (!payload.sub || typeof payload.sub !== 'string' || payload.sub.trim() === '') {
    const error = new Error('Google ID token missing subject (sub) claim.');
    error.statusCode = 401;
    throw error;
  }

  // 6. Non-empty email claim
  if (!payload.email || typeof payload.email !== 'string' || payload.email.trim() === '') {
    const error = new Error('Google ID token missing or invalid email claim.');
    error.statusCode = 401;
    throw error;
  }

  return {
    sub: payload.sub.trim(),
    email: payload.email.toLowerCase().trim(),
    name: (payload.name || payload.given_name || payload.email.split('@')[0]).trim(),
    picture: payload.picture,
  };
}

/**
 * Find or create user from verified Google identity.
 *
 * Security Safeguards:
 * - Prevents duplicate users & duplicate Google IDs via database-level UNIQUE constraints.
 * - Prevents account takeover: Never auto-links Google identities to existing accounts with matching email.
 * - Safe email sync: Updates Google user's email only if the new email does not collide with an existing user.
 * - Concurrency protection: Gracefully handles race conditions during simultaneous first-time sign-ins.
 *
 * @param {{ sub: string, email: string, name: string }} googleProfile
 * @returns {Promise<{ token: string, user: object }>}
 */
async function authenticateGoogleUser({ sub, email, name }) {
  const cleanSub = String(sub).trim();
  const cleanEmail = String(email).toLowerCase().trim();
  const cleanName = String(name || cleanEmail.split('@')[0]).trim();

  // 1. Look up user by Google's permanent, unique subject identifier
  const existingGoogleUser = await query(
    `SELECT u.id, u.name, u.email, u.password_hash, u.google_id, u.created_at,
            p.birth_year, p.average_cycle_length, p.average_period_duration, p.onboarding_completed
     FROM users u
     LEFT JOIN user_profiles p ON u.id = p.user_id
     WHERE u.google_id = $1`,
    [cleanSub]
  );

  if (existingGoogleUser.rows.length > 0) {
    const user = existingGoogleUser.rows[0];

    // If user's Google email changed, update safely if the new email is not taken by another user
    if (user.email.toLowerCase() !== cleanEmail) {
      const emailConflict = await query(
        'SELECT id FROM users WHERE LOWER(email) = LOWER($1) AND id != $2',
        [cleanEmail, user.id]
      );
      if (emailConflict.rows.length === 0) {
        await query(
          'UPDATE users SET email = $1, name = COALESCE(NULLIF($2, \'\'), name), updated_at = NOW() WHERE id = $3',
          [cleanEmail, cleanName, user.id]
        );
        user.email = cleanEmail;
        if (cleanName) user.name = cleanName;
      }
    }

    const token = generateToken({ userId: String(user.id), email: user.email });
    const isOnboarded = Boolean(user.onboarding_completed);

    return {
      token,
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        has_password: Boolean(user.password_hash),
        is_google_linked: true,
        auth_providers: user.password_hash ? ['email', 'google'] : ['google'],
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
    };
  }

  // 2. Check if an account already exists with this email (case-insensitive)
  // To prevent pre-account and post-account takeover vulnerabilities, DO NOT auto-link accounts
  const existingEmailUser = await query(
    'SELECT id, name, email, google_id, password_hash, auth_provider FROM users WHERE LOWER(email) = LOWER($1)',
    [cleanEmail]
  );

  if (existingEmailUser.rows.length > 0) {
    const conflictUser = existingEmailUser.rows[0];
    const error = new Error(
      conflictUser.password_hash
        ? 'An account with this email address already exists using password authentication. Please log in with your email and password.'
        : 'An account with this email address already exists. Please log in with your original authentication method.'
    );
    error.statusCode = 409;
    error.code = 'ACCOUNT_LINK_REQUIRED';
    throw error;
  }

  // 3. Create new user in PostgreSQL schema atomically
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const insertUser = await client.query(
      `INSERT INTO users (name, email, google_id, auth_provider, created_at, updated_at)
       VALUES ($1, $2, $3, 'google', NOW(), NOW())
       RETURNING id, name, email, created_at`,
      [cleanName, cleanEmail, cleanSub]
    );
    const newUser = insertUser.rows[0];

    const insertProfile = await client.query(
      `INSERT INTO user_profiles (
        user_id,
        average_cycle_length,
        average_period_duration,
        onboarding_completed,
        created_at,
        updated_at
      )
      VALUES ($1, 28, 5, false, NOW(), NOW())
      RETURNING birth_year, average_cycle_length, average_period_duration, onboarding_completed`,
      [newUser.id]
    );
    const userProfile = insertProfile.rows[0];

    await client.query('COMMIT');

    const token = generateToken({ userId: String(newUser.id), email: newUser.email });
    const isOnboarded = Boolean(userProfile.onboarding_completed);

    return {
      token,
      user: {
        id: String(newUser.id),
        name: newUser.name,
        email: newUser.email,
        has_password: false,
        is_google_linked: true,
        auth_providers: ['google'],
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
    };
  } catch (err) {
    await client.query('ROLLBACK');

    // Concurrency / Race Condition Guard:
    // If another concurrent request inserted this google_id at the same time,
    // gracefully resolve to the existing user instead of throwing an error.
    if (err.code === '23505') {
      if (err.constraint === 'users_google_id_key') {
        const retryUser = await query(
          `SELECT u.id, u.name, u.email, u.password_hash, u.google_id, u.created_at,
                  p.birth_year, p.average_cycle_length, p.average_period_duration, p.onboarding_completed
           FROM users u
           LEFT JOIN user_profiles p ON u.id = p.user_id
           WHERE u.google_id = $1`,
          [cleanSub]
        );
        if (retryUser.rows.length > 0) {
          const user = retryUser.rows[0];
          const token = generateToken({ userId: String(user.id), email: user.email });
          return {
            token,
            user: {
              id: String(user.id),
              name: user.name,
              email: user.email,
              has_password: Boolean(user.password_hash),
              is_google_linked: true,
              auth_providers: user.password_hash ? ['email', 'google'] : ['google'],
              created_at: user.created_at,
              profile: {
                birth_year: user.birth_year,
                average_cycle_length: user.average_cycle_length,
                average_period_duration: user.average_period_duration,
                onboarding_completed: user.onboarding_completed,
              },
            },
          };
        }
      }

      // If email was concurrently registered, return clean 409 conflict
      const error = new Error('An account with this email address already exists. Please log in using your existing account.');
      error.statusCode = 409;
      error.code = 'ACCOUNT_LINK_REQUIRED';
      throw error;
    }

    throw err;
  } finally {
    client.release();
  }
}

/**
 * Link Google identity to an existing authenticated user
 *
 * Requirements:
 * - Requires authenticated Lunari user.
 * - Confirms Google ID token identity (sub, email, verified claims).
 * - Ensures Google identity is not already linked to another user.
 * - Confirms Google email matches user's registered email.
 * - Updates user row transactionally and preserves all period/cycle data.
 *
 * @param {{ userId: string, googleProfile: { sub: string, email: string, name?: string } }}
 * @returns {Promise<object>}
 */
async function linkGoogleAccount({ userId, googleProfile }) {
  const cleanSub = String(googleProfile.sub).trim();
  const cleanEmail = String(googleProfile.email).toLowerCase().trim();

  // 1. Fetch authenticated user
  const userRes = await query(
    `SELECT u.id, u.name, u.email, u.google_id, u.password_hash, u.auth_provider, u.created_at,
            p.birth_year, p.average_cycle_length, p.average_period_duration, p.onboarding_completed
     FROM users u
     LEFT JOIN user_profiles p ON u.id = p.user_id
     WHERE u.id = $1`,
    [userId]
  );

  if (userRes.rows.length === 0) {
    const error = new Error('User account not found.');
    error.statusCode = 404;
    throw error;
  }

  const user = userRes.rows[0];

  // 2. Already linked to this exact Google account? Idempotent success
  if (user.google_id === cleanSub) {
    const isOnboarded = Boolean(user.onboarding_completed);
    return {
      id: String(user.id),
      name: user.name,
      email: user.email,
      has_password: Boolean(user.password_hash),
      is_google_linked: true,
      auth_providers: user.password_hash ? ['email', 'google'] : ['google'],
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
    };
  }

  // 3. User already linked to a different Google account
  if (user.google_id && user.google_id !== cleanSub) {
    const error = new Error('This account is already linked to a different Google identity.');
    error.statusCode = 409;
    error.code = 'ACCOUNT_ALREADY_LINKED';
    throw error;
  }

  // 4. Google sub already linked to another user
  const conflictRes = await query(
    'SELECT id FROM users WHERE google_id = $1 AND id != $2',
    [cleanSub, user.id]
  );
  if (conflictRes.rows.length > 0) {
    const error = new Error('This Google identity is already linked to another Lunari account.');
    error.statusCode = 409;
    error.code = 'GOOGLE_ACCOUNT_ALREADY_LINKED';
    throw error;
  }

  // 5. Confirm that the Google identity belongs to the account being linked
  if (cleanEmail !== user.email.toLowerCase()) {
    const error = new Error('Google account email does not match your registered account email.');
    error.statusCode = 400;
    error.code = 'EMAIL_MISMATCH';
    throw error;
  }

  // 6. Transactionally update user record
  const newProvider = user.password_hash ? 'both' : 'google';
  const updateRes = await query(
    `UPDATE users
     SET google_id = $1, auth_provider = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING id, name, email, google_id, password_hash, auth_provider, created_at, updated_at`,
    [cleanSub, newProvider, user.id]
  );
  const updated = updateRes.rows[0];
  const isOnboarded = Boolean(user.onboarding_completed);

  return {
    id: String(updated.id),
    name: updated.name,
    email: updated.email,
    has_password: Boolean(updated.password_hash),
    is_google_linked: true,
    auth_providers: updated.password_hash ? ['email', 'google'] : ['google'],
    created_at: updated.created_at,
    onboarding_completed: isOnboarded,
    onboardingCompleted: isOnboarded,
    profile: {
      birth_year: user.birth_year,
      average_cycle_length: user.average_cycle_length,
      average_period_duration: user.average_period_duration,
      onboarding_completed: isOnboarded,
      onboardingCompleted: isOnboarded,
    },
  };
}

module.exports = {
  getAllowedClientIds,
  verifyGoogleIdToken,
  authenticateGoogleUser,
  linkGoogleAccount,
  _setOAuth2Client,
};
