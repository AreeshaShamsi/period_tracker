const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const assert = require('assert');
const buildApp = require('./src/app');
const { query } = require('./src/config/database');
const { verifyToken } = require('./src/services/auth.service');
const googleAuthService = require('./src/services/googleAuth.service');
const firebaseConfig = require('./src/config/firebase');

async function runGoogleAuthTests() {
  console.log('====================================================');
  console.log(' Lunari Firebase/Google Authentication Test Suite');
  console.log('====================================================\n');

  const app = await buildApp();

  try {
    // -----------------------------------------------------------------
    // 1. Missing & Blank ID Tokens (HTTP 401)
    // -----------------------------------------------------------------
    console.log('--- 1. Testing Missing & Blank ID Tokens ---');
    const missingRes = await app.inject({
      method: 'POST',
      url: '/api/auth/google',
      payload: {},
    });
    assert.strictEqual(missingRes.statusCode, 401, 'POST /api/auth/google without token returns 401');
    assert(JSON.parse(missingRes.payload).message.includes('required'), 'Reports required token error');
    console.log('  ✓ Missing token rejected with 401');

    const emptyRes = await app.inject({
      method: 'POST',
      url: '/api/auth/google',
      payload: { idToken: '   ' },
    });
    assert.strictEqual(emptyRes.statusCode, 401, 'POST /api/auth/google with whitespace token returns 401');
    console.log('  ✓ Empty/blank token rejected with 401');

    // -----------------------------------------------------------------
    // 2. Missing Server Configuration Safety
    // -----------------------------------------------------------------
    console.log('\n--- 2. Testing Missing Server Configuration Safety ---');
    googleAuthService._setAuthInstance(null);
    const savedProjectId = process.env.FIREBASE_PROJECT_ID;
    const savedEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const savedKey = process.env.FIREBASE_PRIVATE_KEY;
    const savedPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    const savedGac = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    delete process.env.FIREBASE_PROJECT_ID;
    delete process.env.FIREBASE_CLIENT_EMAIL;
    delete process.env.FIREBASE_PRIVATE_KEY;
    delete process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;

    await assert.rejects(
      async () => {
        await googleAuthService.verifyFirebaseIdToken('any-token');
      },
      (err) => {
        return err.statusCode === 500 && err.message.includes('Firebase Admin SDK is not configured');
      },
      'Fails safely when Firebase Admin credentials are unconfigured on server'
    );
    console.log('  ✓ Server throws 500 and prevents bypass when Firebase Admin credentials are missing');

    // Restore environment variables
    if (savedProjectId) process.env.FIREBASE_PROJECT_ID = savedProjectId;
    if (savedEmail) process.env.FIREBASE_CLIENT_EMAIL = savedEmail;
    if (savedKey) process.env.FIREBASE_PRIVATE_KEY = savedKey;
    if (savedPath) process.env.FIREBASE_SERVICE_ACCOUNT_PATH = savedPath;
    if (savedGac) process.env.GOOGLE_APPLICATION_CREDENTIALS = savedGac;

    // -----------------------------------------------------------------
    // 3. Token Claims Validation (Signature, Exp, Email, UID)
    // -----------------------------------------------------------------
    console.log('\n--- 3. Testing Token Claims Validation (Signature, Exp, Email, UID) ---');

    // 3a. Invalid signature / library verification failure
    const mockAuthFail = {
      verifyIdToken: async () => {
        const err = new Error('Firebase ID token has invalid signature');
        err.code = 'auth/invalid-id-token';
        throw err;
      },
    };
    googleAuthService._setAuthInstance(mockAuthFail);

    const malformedRes = await app.inject({
      method: 'POST',
      url: '/api/auth/google',
      payload: { idToken: 'invalid.jwt.token' },
    });
    assert.strictEqual(malformedRes.statusCode, 401, 'POST /api/auth/google with invalid token returns 401');
    console.log('  ✓ Invalid token signature / malformed token rejected with 401');

    // 3b. Expired token claim
    const mockAuthExpired = {
      verifyIdToken: async () => ({
        uid: 'user-uid-expired',
        sub: 'user-uid-expired',
        email: 'user@example.com',
        email_verified: true,
        exp: Math.floor(Date.now() / 1000) - 60, // 60s in the past
      }),
    };
    googleAuthService._setAuthInstance(mockAuthExpired);

    await assert.rejects(
      async () => {
        await googleAuthService.verifyFirebaseIdToken('expired-token');
      },
      (err) => err.statusCode === 401 && err.message.includes('expired'),
      'Rejects expired token with 401'
    );
    console.log('  ✓ Expired token rejected with 401');

    // 3c. Unverified email claim
    const mockAuthUnverifiedEmail = {
      verifyIdToken: async () => ({
        uid: 'user-uid-unverified',
        sub: 'user-uid-unverified',
        email: 'unverified@example.com',
        email_verified: false,
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    };
    googleAuthService._setAuthInstance(mockAuthUnverifiedEmail);

    await assert.rejects(
      async () => {
        await googleAuthService.verifyFirebaseIdToken('unverified-email-token');
      },
      (err) => err.statusCode === 401 && err.message.includes('not verified'),
      'Rejects unverified email with 401'
    );
    console.log('  ✓ Unverified email claim rejected with 401');

    // 3d. Missing UID claim
    const mockAuthMissingUid = {
      verifyIdToken: async () => ({
        uid: '',
        sub: '',
        email: 'user@example.com',
        email_verified: true,
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    };
    googleAuthService._setAuthInstance(mockAuthMissingUid);

    await assert.rejects(
      async () => {
        await googleAuthService.verifyFirebaseIdToken('missing-uid-token');
      },
      (err) => err.statusCode === 401 && err.message.includes('missing subject/UID'),
      'Rejects missing UID claim with 401'
    );
    console.log('  ✓ Missing UID claim rejected with 401');

    // 3e. Missing email claim
    const mockAuthMissingEmail = {
      verifyIdToken: async () => ({
        uid: 'user-uid-no-email',
        sub: 'user-uid-no-email',
        email: '',
        email_verified: true,
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    };
    googleAuthService._setAuthInstance(mockAuthMissingEmail);

    await assert.rejects(
      async () => {
        await googleAuthService.verifyFirebaseIdToken('missing-email-token');
      },
      (err) => err.statusCode === 401 && err.message.includes('missing or invalid email'),
      'Rejects missing email claim with 401'
    );
    console.log('  ✓ Missing email claim rejected with 401');

    // -----------------------------------------------------------------
    // 4. Valid Token Verification & User Creation
    // -----------------------------------------------------------------
    console.log('\n--- 4. Testing Valid Token Verification & User Provisioning ---');
    const validTestUid = 'firebase-uid-' + Date.now();
    const validTestEmail = `firebase.user.${Date.now()}@example.com`;
    const validTestName = 'Firebase Verified Tester';

    const mockAuthSuccess = {
      verifyIdToken: async () => ({
        uid: validTestUid,
        sub: validTestUid,
        email: validTestEmail,
        name: validTestName,
        email_verified: true,
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    };
    googleAuthService._setAuthInstance(mockAuthSuccess);

    // Call POST /api/auth/google with the mocked valid token
    const validAuthRes = await app.inject({
      method: 'POST',
      url: '/api/auth/google',
      payload: { idToken: 'valid-firebase-token' },
    });
    assert.strictEqual(validAuthRes.statusCode, 200, 'POST /api/auth/google returns 200 for valid token');
    const authData = JSON.parse(validAuthRes.payload).data;

    assert(authData.token, 'Issues Lunari session token');
    assert.strictEqual(authData.user.email, validTestEmail, 'User email matches verified Firebase identity');
    assert.strictEqual(authData.user.name, validTestName, 'User name matches verified Firebase identity');
    assert.strictEqual(authData.user.profile.average_cycle_length, 28, 'Default profile cycle length is 28');
    assert.strictEqual(authData.user.profile.onboarding_completed, false, 'Onboarding initially incomplete');
    assert.strictEqual(authData.user.is_google_linked, true, 'is_google_linked is true');
    console.log('  ✓ Valid token verified and user + profile created atomically');

    const googleUserId = authData.user.id;
    const sessionToken = authData.token;

    // Verify Lunari JWT token contents
    const decoded = verifyToken(sessionToken);
    assert.strictEqual(decoded.userId, googleUserId, 'Lunari token contains correct userId');
    console.log('  ✓ Session JWT contains valid user identity claim');

    // -----------------------------------------------------------------
    // 5. Existing Google User Subsequent Login (No Duplicates)
    // -----------------------------------------------------------------
    console.log('\n--- 5. Testing Existing Google User Login (No Duplicates) ---');
    const repeatLoginRes = await app.inject({
      method: 'POST',
      url: '/api/auth/google',
      payload: { idToken: 'valid-firebase-token' },
    });
    assert.strictEqual(repeatLoginRes.statusCode, 200, 'POST /api/auth/google succeeds for returning user');
    const repeatData = JSON.parse(repeatLoginRes.payload).data;
    assert.strictEqual(repeatData.user.id, googleUserId, 'Returns exact same user ID');

    // Ensure database count is strictly 1
    const countCheck = await query('SELECT COUNT(*) AS total FROM users WHERE firebase_uid = $1 OR google_id = $1', [validTestUid]);
    assert.strictEqual(parseInt(countCheck.rows[0].total, 10), 1, 'Exactly one user record exists in database');
    console.log('  ✓ Returning user logs in smoothly without duplicating database records');

    // -----------------------------------------------------------------
    // 6. Anti-Account Takeover & Legacy Migration Safeguards
    // -----------------------------------------------------------------
    console.log('\n--- 6. Testing Anti-Account Takeover & Legacy Migration Safeguards ---');

    // 6a. Register user who already has an established Firebase UID
    const victimEmail = `victim.${Date.now()}@example.com`;
    const legitUid = 'legit-uid-' + Date.now();
    const signupRes = await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: {
        name: 'Victim User',
        email: victimEmail,
        password: 'ValidPassword123!',
      },
    });
    assert.strictEqual(signupRes.statusCode, 201, 'Password user created');
    const passwordUserToken = JSON.parse(signupRes.payload).data.token;
    const passwordUserId = JSON.parse(signupRes.payload).data.user.id;

    // Assign legit Firebase UID to simulate an established user
    await query('UPDATE users SET firebase_uid = $1, auth_provider = \'both\' WHERE id = $2', [legitUid, passwordUserId]);

    // 6b. Attacker / unlinked Google user tries to sign in with victim's email and a different UID
    const attackerUid = 'attacker-uid-' + Date.now();
    const mockAuthTakeover = {
      verifyIdToken: async () => ({
        uid: attackerUid,
        sub: attackerUid,
        email: victimEmail,
        name: 'Attacker Fake Profile',
        email_verified: true,
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    };
    googleAuthService._setAuthInstance(mockAuthTakeover);

    const takeoverRes = await app.inject({
      method: 'POST',
      url: '/api/auth/google',
      payload: { idToken: 'attacker-token' },
    });
    assert.strictEqual(takeoverRes.statusCode, 409, 'Rejects unlinked Google login with 409 Conflict');
    const takeoverBody = JSON.parse(takeoverRes.payload);
    assert.strictEqual(takeoverBody.code, 'ACCOUNT_LINK_REQUIRED', 'Returns ACCOUNT_LINK_REQUIRED code');
    console.log('  ✓ Blocked takeover attempt of existing account with 409 Conflict');

    // Confirm victim account was untouched
    const untouchedCheck = await query('SELECT google_id, firebase_uid, password_hash FROM users WHERE id = $1', [passwordUserId]);
    assert.strictEqual(untouchedCheck.rows[0].firebase_uid, legitUid, 'Firebase UID remains unchanged');
    assert(untouchedCheck.rows[0].password_hash, 'Password hash is completely intact');
    console.log('  ✓ Existing account preserved completely untouched');

    // 6c. Legacy PostgreSQL User Migration (User 25 Scenario: firebase_uid IS NULL)
    const legacyEmail = `legacy.user.${Date.now()}@example.com`;
    const legacyInsert = await query(
      `INSERT INTO users (name, email, password_hash, auth_provider, created_at, updated_at)
       VALUES ($1, $2, '$2b$12$legacyBcryptPasswordHash...', 'email', NOW(), NOW())
       RETURNING id, name, email`,
      ['Legacy Areesha User', legacyEmail]
    );
    const legacyUser = legacyInsert.rows[0];
    await query(
      `INSERT INTO user_profiles (user_id, average_cycle_length, average_period_duration, onboarding_completed, created_at, updated_at)
       VALUES ($1, 29, 6, true, NOW(), NOW())`,
      [legacyUser.id]
    );

    const googleMigrationUid = 'google-migration-uid-' + Date.now();
    const mockAuthMigration = {
      verifyIdToken: async () => ({
        uid: googleMigrationUid,
        sub: googleMigrationUid,
        email: legacyEmail,
        name: 'Legacy Areesha User (Google)',
        email_verified: true,
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    };
    googleAuthService._setAuthInstance(mockAuthMigration);

    const migrationRes = await app.inject({
      method: 'POST',
      url: '/api/auth/google',
      payload: { idToken: 'migration-token' },
    });
    assert.strictEqual(migrationRes.statusCode, 200, 'Legacy user Google login succeeds with 200');
    const migrationData = JSON.parse(migrationRes.payload).data;
    assert.strictEqual(migrationData.user.id, String(legacyUser.id), 'Preserves existing PostgreSQL user ID');
    assert.strictEqual(migrationData.user.firebase_uid, googleMigrationUid, 'Maps verified Firebase UID');
    assert.strictEqual(migrationData.user.has_password, true, 'Reports password presence accurately');
    assert.strictEqual(migrationData.user.onboarding_completed, true, 'Preserves profile onboarding state');

    const dbLegacyCheck = await query('SELECT firebase_uid, google_id, password_hash, auth_provider FROM users WHERE id = $1', [legacyUser.id]);
    assert.strictEqual(dbLegacyCheck.rows[0].firebase_uid, googleMigrationUid, 'DB firebase_uid mapped');
    assert.strictEqual(dbLegacyCheck.rows[0].google_id, googleMigrationUid, 'DB google_id mapped');
    assert.strictEqual(dbLegacyCheck.rows[0].password_hash, '$2b$12$legacyBcryptPasswordHash...', 'DB password_hash preserved');
    console.log('  ✓ Legacy PostgreSQL user safely migrated upon Google sign-in without data loss');

    // 6d. Regression Test: Already-Linked Google/Firebase Account Signs In Successfully
    // User already has google_id, firebase_uid, password_hash, auth_provider = 'both', profile and periods.
    const alreadyLinkedEmail = `areesha.linked.${Date.now()}@gmail.com`;
    const googleSubId = 'google-sub-linked-' + Date.now(); // Google numeric provider ID
    const insertLinkedRes = await query(
      `INSERT INTO users (name, email, google_id, firebase_uid, password_hash, auth_provider, created_at, updated_at)
       VALUES ($1, $2, $3, $3, '$2b$12$existingBcryptPasswordHash...', 'both', NOW(), NOW())
       RETURNING id, name, email`,
      ['Areesha Linked User', alreadyLinkedEmail, googleSubId]
    );
    const alreadyLinkedUser = insertLinkedRes.rows[0];
    await query(
      `INSERT INTO user_profiles (user_id, birth_year, average_cycle_length, average_period_duration, onboarding_completed, created_at, updated_at)
       VALUES ($1, 1995, 28, 4, true, NOW(), NOW())`,
      [alreadyLinkedUser.id]
    );
    await query(
      `INSERT INTO periods (user_id, start_date, end_date, created_at, updated_at)
       VALUES ($1, '2026-09-01', '2026-09-05', NOW(), NOW())`,
      [alreadyLinkedUser.id]
    );

    // Incoming token from Firebase Google Sign-In with real Firebase Auth UID and google.com identity claim
    const actualFirebaseUid = 'fb-auth-uid-' + Date.now();
    const mockAuthAlreadyLinked = {
      verifyIdToken: async () => ({
        uid: actualFirebaseUid,
        sub: actualFirebaseUid,
        email: alreadyLinkedEmail,
        name: 'Areesha Linked User',
        email_verified: true,
        exp: Math.floor(Date.now() / 1000) + 3600,
        firebase: {
          identities: {
            'google.com': [googleSubId],
            email: [alreadyLinkedEmail],
          },
          sign_in_provider: 'google.com',
        },
      }),
    };
    googleAuthService._setAuthInstance(mockAuthAlreadyLinked);

    const alreadyLinkedLoginRes = await app.inject({
      method: 'POST',
      url: '/api/auth/google',
      payload: { idToken: 'firebase-google-token' },
    });
    assert.strictEqual(alreadyLinkedLoginRes.statusCode, 200, 'Already-linked Google account logs in without 409 conflict');
    const alreadyLinkedData = JSON.parse(alreadyLinkedLoginRes.payload).data;
    assert.strictEqual(alreadyLinkedData.user.id, String(alreadyLinkedUser.id), 'Returns existing user ID (no duplicates)');
    assert.strictEqual(alreadyLinkedData.user.firebase_uid, actualFirebaseUid, 'Synchronizes Firebase Auth UID');
    assert.strictEqual(alreadyLinkedData.user.has_password, true, 'has_password remains true');
    assert.strictEqual(alreadyLinkedData.user.onboarding_completed, true, 'Profile onboarding_completed preserved');
    assert.strictEqual(alreadyLinkedData.user.profile.average_cycle_length, 28, 'Preserves average_cycle_length');

    // Database verification: periods and password_hash preserved
    const dbAlreadyLinkedCheck = await query(
      'SELECT firebase_uid, google_id, password_hash, auth_provider FROM users WHERE id = $1',
      [alreadyLinkedUser.id]
    );
    assert.strictEqual(dbAlreadyLinkedCheck.rows[0].firebase_uid, actualFirebaseUid, 'firebase_uid updated to Firebase Auth UID');
    assert.strictEqual(dbAlreadyLinkedCheck.rows[0].google_id, googleSubId, 'google_id preserves Google provider sub ID');
    assert.strictEqual(dbAlreadyLinkedCheck.rows[0].password_hash, '$2b$12$existingBcryptPasswordHash...', 'password_hash preserved');

    const periodCheck = await query('SELECT COUNT(*) AS total FROM periods WHERE user_id = $1', [alreadyLinkedUser.id]);
    assert.strictEqual(parseInt(periodCheck.rows[0].total, 10), 1, 'Period records preserved intact');
    console.log('  ✓ Already-linked Google/Firebase account logs in smoothly with 200 (no 409 conflict)');

    // 6e. Real User ID 24 Verification: areeshashamsi11@gmail.com
    const realUser24Uid = 'firebase-uid-user24-' + Date.now();
    const mockAuthUser24 = {
      verifyIdToken: async () => ({
        uid: realUser24Uid,
        sub: realUser24Uid,
        email: 'areeshashamsi11@gmail.com',
        name: 'Areesha',
        email_verified: true,
        exp: Math.floor(Date.now() / 1000) + 3600,
        firebase: {
          identities: {
            'google.com': ['115766015460813831485'],
            email: ['areeshashamsi11@gmail.com'],
          },
          sign_in_provider: 'google.com',
        },
      }),
    };
    googleAuthService._setAuthInstance(mockAuthUser24);

    const user24LoginRes = await app.inject({
      method: 'POST',
      url: '/api/auth/google',
      payload: { idToken: 'user-24-firebase-token' },
    });
    assert.strictEqual(user24LoginRes.statusCode, 200, 'User 24 logs in successfully without 409 conflict');
    const user24Data = JSON.parse(user24LoginRes.payload).data;
    assert.strictEqual(user24Data.user.id, '24', 'Logs into exact PostgreSQL user ID 24');
    assert.strictEqual(user24Data.user.email, 'areeshashamsi11@gmail.com');
    assert.strictEqual(user24Data.user.has_password, true, 'User 24 has_password preserved');
    assert.strictEqual(user24Data.user.onboarding_completed, true, 'User 24 onboarding_completed preserved');
    assert.strictEqual(user24Data.user.profile.average_period_duration, 4, 'User 24 average_period_duration preserved');
    console.log('  ✓ PostgreSQL User ID 24 (areeshashamsi11@gmail.com) logs in with 200 OK without 409 conflict');

    // -----------------------------------------------------------------
    // 7. Explicit Authenticated Account Linking
    // -----------------------------------------------------------------
    console.log('\n--- 7. Testing Explicit Authenticated Account Linking ---');
    const linkUserEmail = `link.test.${Date.now()}@example.com`;
    const linkSignupRes = await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: {
        name: 'Link Test User',
        email: linkUserEmail,
        password: 'ValidPassword123!',
      },
    });
    assert.strictEqual(linkSignupRes.statusCode, 201, 'Link test user created');
    const linkUserToken = JSON.parse(linkSignupRes.payload).data.token;
    const linkUserId = JSON.parse(linkSignupRes.payload).data.user.id;

    // 7a. Unauthorized linking attempt (no Bearer token) -> 401
    const unauthLinkRes = await app.inject({
      method: 'POST',
      url: '/api/auth/link-google',
      payload: { idToken: 'some-token' },
    });
    assert.strictEqual(unauthLinkRes.statusCode, 401, 'Unauthenticated linking rejected with 401');
    console.log('  ✓ Unauthenticated linking rejected with 401');

    // 7b. Email mismatch linking attempt -> 400
    const mismatchUid = 'mismatch-uid-' + Date.now();
    const mockAuthMismatch = {
      verifyIdToken: async () => ({
        uid: mismatchUid,
        sub: mismatchUid,
        email: 'different-email@example.com',
        name: 'Different Email User',
        email_verified: true,
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    };
    googleAuthService._setAuthInstance(mockAuthMismatch);

    const mismatchLinkRes = await app.inject({
      method: 'POST',
      url: '/api/auth/link-google',
      headers: { authorization: `Bearer ${linkUserToken}` },
      payload: { idToken: 'mismatch-token' },
    });
    assert.strictEqual(mismatchLinkRes.statusCode, 400, 'Rejects mismatched email linking with 400');
    assert.strictEqual(JSON.parse(mismatchLinkRes.payload).code, 'EMAIL_MISMATCH');
    console.log('  ✓ Mismatched email rejected with 400 EMAIL_MISMATCH');

    // 7c. Legitimate account owner links matching Google account -> 200
    const legitimateUid = 'legit-uid-' + Date.now();
    const mockAuthLegit = {
      verifyIdToken: async () => ({
        uid: legitimateUid,
        sub: legitimateUid,
        email: linkUserEmail,
        name: 'Victim Google Account',
        email_verified: true,
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    };
    googleAuthService._setAuthInstance(mockAuthLegit);

    const legitLinkRes = await app.inject({
      method: 'POST',
      url: '/api/auth/link-google',
      headers: { authorization: `Bearer ${linkUserToken}` },
      payload: { idToken: 'legit-token' },
    });
    assert.strictEqual(legitLinkRes.statusCode, 200, 'Authenticated linking succeeds with 200');
    const linkedUser = JSON.parse(legitLinkRes.payload).data.user;
    assert.strictEqual(linkedUser.is_google_linked, true, 'is_google_linked updated to true');
    assert(linkedUser.auth_providers.includes('email') && linkedUser.auth_providers.includes('google'), 'Has both email and google providers');
    console.log('  ✓ Legitimate owner successfully links Google account');

    // 7d. Linked user can now sign in with Google
    const linkedGoogleLoginRes = await app.inject({
      method: 'POST',
      url: '/api/auth/google',
      payload: { idToken: 'legit-token' },
    });
    assert.strictEqual(linkedGoogleLoginRes.statusCode, 200, 'Linked user can log in via Google');
    assert.strictEqual(JSON.parse(linkedGoogleLoginRes.payload).data.user.id, linkUserId, 'Logs into original account');
    console.log('  ✓ Linked user successfully logs in via Google');

    // 7e. Linked user can still sign in with Password
    const passwordLoginRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: linkUserEmail,
        password: 'ValidPassword123!',
      },
    });
    assert.strictEqual(passwordLoginRes.statusCode, 200, 'Linked user can still log in via Password');
    console.log('  ✓ Linked user successfully logs in via Password');

    // -----------------------------------------------------------------
    // 8. Testing Protected Endpoints & Logout with Issued Token
    // -----------------------------------------------------------------
    console.log('\n--- 8. Testing Protected Endpoints & Logout with Issued Token ---');
    const meRes = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: { authorization: `Bearer ${sessionToken}` },
    });
    assert.strictEqual(meRes.statusCode, 200, 'GET /api/auth/me returns 200 with session token');
    const meData = JSON.parse(meRes.payload).data;
    assert.strictEqual(meData.user.id, googleUserId);
    assert.strictEqual(meData.user.is_google_linked, true);
    console.log('  ✓ Protected /api/auth/me accessible with issued Lunari session token');

    const logoutRes = await app.inject({
      method: 'POST',
      url: '/api/auth/logout',
      headers: { authorization: `Bearer ${sessionToken}` },
    });
    assert.strictEqual(logoutRes.statusCode, 200, 'Logout succeeds for Google user');

    const meAfterLogout = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: { authorization: `Bearer ${sessionToken}` },
    });
    assert.strictEqual(meAfterLogout.statusCode, 401, 'Token properly revoked after logout');
    console.log('  ✓ Token properly revoked on server after logout');

    // -----------------------------------------------------------------
    // 9. Testing Firebase Email/Password Auth with ID Token
    // -----------------------------------------------------------------
    console.log('\n--- 9. Testing Firebase Email/Password Auth with ID Token ---');
    const fbEmail = `fb_user_${Date.now()}@example.com`;
    const fbUid = `fb-uid-${Date.now()}`;

    // Mock Firebase Auth verifying this email/password user
    const mockAuthEmailUser = {
      verifyIdToken: async (token) => {
        if (token === 'valid-fb-token') {
          return {
            uid: fbUid,
            sub: fbUid,
            email: fbEmail,
            email_verified: false, // Email/password signups in Firebase can have email_verified: false
            exp: Math.floor(Date.now() / 1000) + 3600,
            firebase: { sign_in_provider: 'password' },
          };
        }
        if (token === 'mismatched-email-token') {
          return {
            uid: 'some-other-uid',
            sub: 'some-other-uid',
            email: 'different@example.com',
            email_verified: false,
            exp: Math.floor(Date.now() / 1000) + 3600,
          };
        }
        const err = new Error('Invalid Firebase token');
        err.code = 'auth/invalid-id-token';
        throw err;
      },
    };
    googleAuthService._setAuthInstance(mockAuthEmailUser);

    // 9a. Signup with mismatched email rejected
    const mismatchRes = await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: {
        name: 'Mismatch User',
        email: fbEmail,
        password: 'password123',
        idToken: 'mismatched-email-token',
      },
    });
    assert.strictEqual(mismatchRes.statusCode, 400, 'POST /api/auth/signup with mismatched token returns 400');
    assert.strictEqual(JSON.parse(mismatchRes.payload).code, 'EMAIL_MISMATCH');
    console.log('  ✓ Signup with mismatched Firebase token rejected with 400 EMAIL_MISMATCH');

    // 9b. Signup with valid Firebase token succeeds and saves firebase_uid
    const fbSignupRes = await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: {
        name: 'Firebase Email User',
        email: fbEmail,
        password: 'password123',
        idToken: 'valid-fb-token',
      },
    });
    assert.strictEqual(fbSignupRes.statusCode, 201, 'POST /api/auth/signup with Firebase token returns 201');
    const fbSignupData = JSON.parse(fbSignupRes.payload).data;
    assert.strictEqual(fbSignupData.user.email, fbEmail);
    assert.strictEqual(fbSignupData.user.firebase_uid, fbUid);
    console.log('  ✓ Firebase Email/Password signup persists user with firebase_uid');

    // 9c. Login with valid Firebase token succeeds
    const fbLoginRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: fbEmail,
        idToken: 'valid-fb-token',
      },
    });
    assert.strictEqual(fbLoginRes.statusCode, 200, 'POST /api/auth/login with Firebase token returns 200');
    const fbLoginData = JSON.parse(fbLoginRes.payload).data;
    assert.strictEqual(fbLoginData.user.email, fbEmail);
    assert.strictEqual(fbLoginData.user.firebase_uid, fbUid);
    console.log('  ✓ Firebase Email/Password login succeeds via verified ID token');

    // 9d. Login with invalid Firebase token rejected
    const fbInvalidLoginRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: fbEmail,
        idToken: 'bad-token',
      },
    });
    assert.strictEqual(fbInvalidLoginRes.statusCode, 401, 'POST /api/auth/login with invalid token returns 401');
    console.log('  ✓ Invalid Firebase ID token during login rejected with 401');

    // -----------------------------------------------------------------
    // 10. Testing Protected API Access with Firebase ID Token Bearer Header
    // -----------------------------------------------------------------
    console.log('\n--- 10. Testing Protected API Access with Firebase ID Token Bearer Header ---');

    // 10a. Request /api/auth/me using Authorization: Bearer <valid-fb-token>
    const fbMeRes = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: {
        authorization: 'Bearer valid-fb-token',
      },
    });
    assert.strictEqual(fbMeRes.statusCode, 200, 'GET /api/auth/me succeeds with Firebase ID token');
    const fbMeData = JSON.parse(fbMeRes.payload).data;
    assert.strictEqual(fbMeData.user.email, fbEmail);
    assert.strictEqual(fbMeData.user.firebase_uid, fbUid);
    console.log('  ✓ Protected /api/auth/me authorized via Firebase ID token Bearer header');

    // 10b. Request protected profile API using Firebase ID token
    const fbProfileRes = await app.inject({
      method: 'GET',
      url: '/api/profile',
      headers: {
        authorization: 'Bearer valid-fb-token',
      },
    });
    assert.strictEqual(fbProfileRes.statusCode, 200, 'GET /api/profile succeeds with Firebase ID token');
    console.log('  ✓ Protected /api/profile accessible via Firebase ID token Bearer header');

    // 10c. Request protected cycle API using Firebase ID token
    const fbCycleRes = await app.inject({
      method: 'GET',
      url: '/api/cycle',
      headers: {
        authorization: 'Bearer valid-fb-token',
      },
    });
    assert.strictEqual(fbCycleRes.statusCode, 200, 'GET /api/cycle succeeds with Firebase ID token');
    console.log('  ✓ Protected /api/cycle accessible via Firebase ID token Bearer header');

    // 10d. Invalid Firebase ID token in Bearer header rejected with 401
    const fbBadBearerRes = await app.inject({
      method: 'GET',
      url: '/api/cycle',
      headers: {
        authorization: 'Bearer bad-token',
      },
    });
    assert.strictEqual(fbBadBearerRes.statusCode, 401, 'Protected route rejects invalid Bearer token with 401');
    console.log('  ✓ Invalid Bearer token on protected route rejected with 401');

    console.log('\n====================================================');
    console.log(' All Firebase/Google Auth Tests Passed Successfully!');
    console.log('====================================================');
  } finally {
    await app.close();
  }
}

if (require.main === module) {
  runGoogleAuthTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('\n❌ Google Auth Test Suite Failed:');
      console.error(err);
      process.exit(1);
    });
}

module.exports = runGoogleAuthTests;
