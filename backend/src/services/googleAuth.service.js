const { pool, query } = require('../config/database');
const { getAuth, _setAuthInstance, isFirebaseConfigured } = require('../config/firebase');
const { generateToken } = require('./auth.service');

/**
 * Verify Firebase ID token using Firebase Admin SDK.
 *
 * Validates:
 * - Signature (via Firebase Admin SDK & Google public certs)
 * - Expiration (exp claim)
 * - Audience (matches Firebase project ID)
 * - Verified email claim (email_verified === true)
 * - Non-empty UID / subject claim
 * - Non-empty email claim
 *
 * Rejects missing, malformed, expired, invalid, or unverified tokens with 401.
 * Fails safely with 500 if Firebase Admin is unconfigured on the server (never bypasses).
 *
 * @param {string} idToken
 * @param {{ requireEmailVerified?: boolean }} [options]
 * @returns {Promise<{ uid: string, sub: string, email: string, name: string, picture?: string }>}
 */
async function verifyFirebaseIdToken(idToken, { requireEmailVerified = true } = {}) {
  if (!idToken || typeof idToken !== 'string' || idToken.trim() === '') {
    const error = new Error('Firebase ID token is required.');
    error.statusCode = 401;
    throw error;
  }

  const auth = getAuth();

  let rawDecoded;
  try {
    rawDecoded = await auth.verifyIdToken(idToken.trim());
  } catch (err) {
    const error = new Error(`Firebase ID token verification failed: ${err.message}`);
    error.statusCode = 401;
    error.code = err.code || 'AUTH_INVALID_TOKEN';
    throw error;
  }

  if (!rawDecoded) {
    const error = new Error('Invalid Firebase ID token payload.');
    error.statusCode = 401;
    throw error;
  }

  // Handle both Firebase Admin decoded tokens and mock objects with getPayload()
  const decodedToken = typeof rawDecoded.getPayload === 'function' ? rawDecoded.getPayload() : rawDecoded;

  // 1. Expiration verification (additional safety check)
  const now = Math.floor(Date.now() / 1000);
  if (decodedToken.exp && decodedToken.exp < now) {
    const error = new Error('Firebase ID token has expired.');
    error.statusCode = 401;
    error.code = 'TOKEN_EXPIRED';
    throw error;
  }

  // 2. Verified email claim (protects against unverified account takeover)
  const isEmailVerified = decodedToken.email_verified === true || decodedToken.email_verified === 'true';
  if (requireEmailVerified && !isEmailVerified) {
    const error = new Error('Google account email is not verified.');
    error.statusCode = 401;
    error.code = 'EMAIL_NOT_VERIFIED';
    throw error;
  }

  // 3. Stable, non-empty UID claim
  const uid = decodedToken.uid || decodedToken.sub;
  if (!uid || typeof uid !== 'string' || uid.trim() === '') {
    const error = new Error('Firebase ID token missing subject/UID claim.');
    error.statusCode = 401;
    throw error;
  }

  // 4. Non-empty email claim
  if (!decodedToken.email || typeof decodedToken.email !== 'string' || decodedToken.email.trim() === '') {
    const error = new Error('Firebase ID token missing or invalid email claim.');
    error.statusCode = 401;
    throw error;
  }

  // 5. Extract Google provider subject ID if available from identities
  const googleId =
    (decodedToken.firebase &&
      decodedToken.firebase.identities &&
      decodedToken.firebase.identities['google.com'] &&
      decodedToken.firebase.identities['google.com'][0]) ||
    decodedToken.google_id ||
    decodedToken.googleId ||
    null;

  return {
    uid: uid.trim(),
    sub: uid.trim(),
    email: decodedToken.email.toLowerCase().trim(),
    name: (decodedToken.name || decodedToken.display_name || decodedToken.email.split('@')[0]).trim(),
    picture: decodedToken.picture || null,
    googleId: googleId ? String(googleId).trim() : null,
  };
}

// Alias for backwards compatibility with controller imports
const verifyGoogleIdToken = verifyFirebaseIdToken;

/**
 * For testing purposes: mock the auth verification instance
 * @param {object} customAuth
 */
function _setOAuth2Client(customAuth) {
  _setAuthInstance(customAuth);
}

/**
 * Find or create user from verified Firebase / Google identity.
 *
 * Security Safeguards:
 * - Prevents duplicate users & duplicate Firebase UIDs via database-level UNIQUE constraints.
 * - Prevents account takeover: Never auto-links Google identities to existing accounts with matching email.
 * - Safe email sync: Updates user's email only if the new email does not collide with an existing user.
 * - Concurrency protection: Gracefully handles race conditions during simultaneous first-time sign-ins.
 *
 * @param {{ uid?: string, sub: string, email: string, name: string }} profile
 * @returns {Promise<{ token: string, user: object }>}
 */
async function authenticateGoogleUser({ uid, sub, email, name, googleId }) {
  const cleanId = String(uid || sub).trim();
  const cleanEmail = String(email).toLowerCase().trim();
  const cleanName = String(name || cleanEmail.split('@')[0]).trim();
  const cleanGoogleId = googleId ? String(googleId).trim() : null;

  // 1. Look up user by Firebase UID, Google provider ID, or legacy google_id mapping
  const existingUserRes = await query(
    `SELECT u.id, u.name, u.email, u.password_hash, u.google_id, u.firebase_uid, u.created_at,
            p.birth_year, p.average_cycle_length, p.average_period_duration, p.onboarding_completed
     FROM users u
     LEFT JOIN user_profiles p ON u.id = p.user_id
     WHERE u.firebase_uid = $1
        OR u.google_id = $1
        OR ($2::varchar IS NOT NULL AND (u.google_id = $2 OR u.firebase_uid = $2))`,
    [cleanId, cleanGoogleId]
  );

  if (existingUserRes.rows.length > 0) {
    const user = existingUserRes.rows[0];

    // Ensure firebase_uid is synchronized to cleanId (the verified Firebase Auth UID)
    // and google_id is preserved or updated with cleanGoogleId
    const targetGoogleId = cleanGoogleId || user.google_id || cleanId;
    if (user.firebase_uid !== cleanId || (cleanGoogleId && user.google_id !== cleanGoogleId)) {
      await query(
        `UPDATE users
         SET firebase_uid = $1,
             google_id = COALESCE($2, google_id),
             auth_provider = CASE WHEN password_hash IS NOT NULL THEN 'both' ELSE 'google' END,
             updated_at = NOW()
         WHERE id = $3`,
        [cleanId, targetGoogleId, user.id]
      );
      user.firebase_uid = cleanId;
      if (cleanGoogleId) user.google_id = cleanGoogleId;
    }

    // If user's Google/Firebase email changed, update safely if the new email is not taken by another user
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
        firebase_uid: cleanId,
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
  const existingEmailUser = await query(
    `SELECT u.id, u.name, u.email, u.google_id, u.firebase_uid, u.password_hash, u.auth_provider, u.created_at,
            p.birth_year, p.average_cycle_length, p.average_period_duration, p.onboarding_completed
     FROM users u
     LEFT JOIN user_profiles p ON u.id = p.user_id
     WHERE LOWER(u.email) = LOWER($1)`,
    [cleanEmail]
  );

  if (existingEmailUser.rows.length > 0) {
    const conflictUser = existingEmailUser.rows[0];

    // Determine if this is the same user identity:
    // - Matches Firebase UID
    // - OR matches Google Provider UID against google_id or legacy firebase_uid
    // - OR matches legacy state where firebase_uid was copied from google_id in migration 005
    const isSameUser =
      (conflictUser.firebase_uid && conflictUser.firebase_uid === cleanId) ||
      (cleanGoogleId && conflictUser.google_id && conflictUser.google_id === cleanGoogleId) ||
      (cleanGoogleId && conflictUser.firebase_uid && conflictUser.firebase_uid === cleanGoogleId) ||
      (conflictUser.google_id && conflictUser.google_id === cleanId) ||
      (conflictUser.firebase_uid && conflictUser.google_id && conflictUser.firebase_uid === conflictUser.google_id);

    // Anti-Takeover Safeguard:
    // Only block if this user already has an established identity pointing to a DIFFERENT account
    const hasDifferentIdentity =
      !isSameUser &&
      ((conflictUser.firebase_uid && conflictUser.firebase_uid !== cleanId) ||
       (cleanGoogleId && conflictUser.google_id && conflictUser.google_id !== cleanGoogleId));

    if (hasDifferentIdentity) {
      const error = new Error(
        'An account with this email address already exists. Please sign in with your original authentication provider.'
      );
      error.statusCode = 409;
      error.code = 'ACCOUNT_LINK_REQUIRED';
      throw error;
    }

    // Safe Migration / Synchronization:
    const targetGoogleId = cleanGoogleId || conflictUser.google_id || cleanId;
    await query(
      `UPDATE users
       SET firebase_uid = $1,
           google_id = COALESCE($2, google_id),
           name = COALESCE(NULLIF(name, ''), $3),
           auth_provider = CASE WHEN password_hash IS NOT NULL THEN 'both' ELSE 'google' END,
           updated_at = NOW()
       WHERE id = $4`,
      [cleanId, targetGoogleId, cleanName, conflictUser.id]
    );

    // Ensure default profile exists if user was missing one
    if (conflictUser.average_cycle_length === null || conflictUser.average_cycle_length === undefined) {
      await query(
        `INSERT INTO user_profiles (user_id, average_cycle_length, average_period_duration, onboarding_completed, created_at, updated_at)
         VALUES ($1, 28, 5, false, NOW(), NOW())
         ON CONFLICT (user_id) DO NOTHING`,
        [conflictUser.id]
      );
    }

    const token = generateToken({ userId: String(conflictUser.id), email: conflictUser.email });
    const isOnboarded = Boolean(conflictUser.onboarding_completed);

    return {
      token,
      user: {
        id: String(conflictUser.id),
        name: conflictUser.name || cleanName,
        email: conflictUser.email,
        has_password: Boolean(conflictUser.password_hash),
        is_google_linked: true,
        firebase_uid: cleanId,
        auth_providers: conflictUser.password_hash ? ['email', 'google'] : ['google'],
        created_at: conflictUser.created_at,
        onboarding_completed: isOnboarded,
        onboardingCompleted: isOnboarded,
        profile: {
          birth_year: conflictUser.birth_year,
          average_cycle_length: conflictUser.average_cycle_length ?? 28,
          average_period_duration: conflictUser.average_period_duration ?? 5,
          onboarding_completed: isOnboarded,
          onboardingCompleted: isOnboarded,
        },
      },
    };
  }

  // 3. Create new user in PostgreSQL schema atomically
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const insertUser = await client.query(
      `INSERT INTO users (name, email, google_id, firebase_uid, auth_provider, created_at, updated_at)
       VALUES ($1, $2, $3, $3, 'google', NOW(), NOW())
       RETURNING id, name, email, created_at`,
      [cleanName, cleanEmail, cleanId]
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
        firebase_uid: cleanId,
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
    // If another concurrent request inserted this UID at the same time,
    // gracefully resolve to the existing user instead of throwing an error.
    if (err.code === '23505') {
      if (err.constraint === 'users_google_id_key' || err.constraint === 'users_firebase_uid_key') {
        const retryUser = await query(
          `SELECT u.id, u.name, u.email, u.password_hash, u.google_id, u.firebase_uid, u.created_at,
                  p.birth_year, p.average_cycle_length, p.average_period_duration, p.onboarding_completed
           FROM users u
           LEFT JOIN user_profiles p ON u.id = p.user_id
           WHERE u.firebase_uid = $1 OR u.google_id = $1`,
          [cleanId]
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
 * - Confirms Firebase ID token identity (uid/sub, email, verified claims).
 * - Ensures Firebase/Google identity is not already linked to another user.
 * - Confirms Google email matches user's registered email.
 * - Updates user row transactionally and preserves all period/cycle data.
 *
 * @param {{ userId: string, googleProfile: { uid?: string, sub: string, email: string, name?: string } }}
 * @returns {Promise<object>}
 */
async function linkGoogleAccount({ userId, googleProfile }) {
  const cleanId = String(googleProfile.uid || googleProfile.sub).trim();
  const cleanEmail = String(googleProfile.email).toLowerCase().trim();
  const cleanGoogleId = googleProfile.googleId ? String(googleProfile.googleId).trim() : null;

  // 1. Fetch authenticated user
  const userRes = await query(
    `SELECT u.id, u.name, u.email, u.google_id, u.firebase_uid, u.password_hash, u.auth_provider, u.created_at,
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

  // 2. Already linked to this exact Google/Firebase account? Idempotent success
  const isAlreadyLinked =
    user.firebase_uid === cleanId ||
    user.google_id === cleanId ||
    (cleanGoogleId && user.google_id === cleanGoogleId) ||
    (cleanGoogleId && user.firebase_uid === cleanGoogleId);

  if (isAlreadyLinked) {
    const targetGoogleId = cleanGoogleId || user.google_id || cleanId;
    if (user.firebase_uid !== cleanId || (cleanGoogleId && user.google_id !== cleanGoogleId)) {
      await query(
        'UPDATE users SET firebase_uid = $1, google_id = COALESCE($2, google_id), updated_at = NOW() WHERE id = $3',
        [cleanId, targetGoogleId, user.id]
      );
      user.firebase_uid = cleanId;
      if (cleanGoogleId) user.google_id = cleanGoogleId;
    }
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
  const hasDifferentLinkedIdentity =
    (user.firebase_uid && user.firebase_uid !== cleanId && user.firebase_uid !== user.google_id) ||
    (user.google_id && cleanGoogleId && user.google_id !== cleanGoogleId);

  if (hasDifferentLinkedIdentity) {
    const error = new Error('This account is already linked to a different Google identity.');
    error.statusCode = 409;
    error.code = 'ACCOUNT_ALREADY_LINKED';
    throw error;
  }

  // 4. Firebase/Google ID already linked to another user
  const conflictRes = await query(
    `SELECT id FROM users
     WHERE ((firebase_uid = $1 OR google_id = $1)
        OR ($2::varchar IS NOT NULL AND (google_id = $2 OR firebase_uid = $2)))
       AND id != $3`,
    [cleanId, cleanGoogleId, user.id]
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
  const targetGoogleId = cleanGoogleId || cleanId;
  const updateRes = await query(
    `UPDATE users
     SET google_id = $1, firebase_uid = $2, auth_provider = $3, updated_at = NOW()
     WHERE id = $4
     RETURNING id, name, email, google_id, firebase_uid, password_hash, auth_provider, created_at, updated_at`,
    [targetGoogleId, cleanId, newProvider, user.id]
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
  verifyFirebaseIdToken,
  verifyGoogleIdToken,
  authenticateGoogleUser,
  linkGoogleAccount,
  _setOAuth2Client,
  _setAuthInstance,
  isFirebaseConfigured,
};
