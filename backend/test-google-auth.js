const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
process.env.GOOGLE_CLIENT_ID_WEB = 'test-web-client-id.apps.googleusercontent.com';
process.env.GOOGLE_CLIENT_ID_ANDROID = 'test-android-client-id.apps.googleusercontent.com';

const assert = require('assert');
const { OAuth2Client } = require('google-auth-library');
const buildApp = require('./src/app');
const { query } = require('./src/config/database');
const { verifyToken } = require('./src/services/auth.service');
const googleAuthService = require('./src/services/googleAuth.service');

async function runGoogleAuthTests() {
  console.log('====================================================');
  console.log(' Lunari Google Authentication Test Suite');
  console.log('====================================================\n');

  const app = await buildApp();

  try {
    // -----------------------------------------------------------------
    // 1. Missing Token Handling (HTTP 401)
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

    const malformedRes = await app.inject({
      method: 'POST',
      url: '/api/auth/google',
      payload: { idToken: 'invalid.jwt.token' },
    });
    assert.strictEqual(malformedRes.statusCode, 401, 'POST /api/auth/google with malformed token returns 401');
    console.log('  ✓ Malformed token rejected with 401');

    // -----------------------------------------------------------------
    // 2. Missing Server Configuration Safety
    // -----------------------------------------------------------------
    console.log('\n--- 2. Testing Missing Server Configuration Safety ---');
    const savedWeb = process.env.GOOGLE_CLIENT_ID_WEB;
    const savedAndroid = process.env.GOOGLE_CLIENT_ID_ANDROID;
    delete process.env.GOOGLE_CLIENT_ID_WEB;
    delete process.env.GOOGLE_CLIENT_ID_ANDROID;

    await assert.rejects(
      async () => {
        await googleAuthService.verifyGoogleIdToken('any-token');
      },
      (err) => {
        return err.statusCode === 500 && err.message.includes('No Google OAuth client IDs configured');
      },
      'Fails safely when no client IDs configured on server without bypassing'
    );
    console.log('  ✓ Server throws 500 and prevents bypass when Client IDs are missing');

    // Restore environment variables
    process.env.GOOGLE_CLIENT_ID_WEB = savedWeb;
    process.env.GOOGLE_CLIENT_ID_ANDROID = savedAndroid;

    // -----------------------------------------------------------------
    // 3. Token Verification Logic (Mocking verifyIdToken)
    // -----------------------------------------------------------------
    console.log('\n--- 3. Testing Token Claims Validation (Signature, Issuer, Audience, Exp, Email) ---');

    // 3a. Invalid signature / library verification failure
    const mockClientFail = {
      verifyIdToken: async () => {
        throw new Error('Invalid signature');
      },
    };
    googleAuthService._setOAuth2Client(mockClientFail);

    await assert.rejects(
      async () => {
        await googleAuthService.verifyGoogleIdToken('bad-sig-token');
      },
      (err) => err.statusCode === 401 && err.message.includes('verification failed'),
      'Rejects invalid token signature with 401'
    );
    console.log('  ✓ Invalid token signature rejected with 401');

    // 3b. Wrong audience claim
    const mockClientWrongAud = {
      verifyIdToken: async () => ({
        getPayload: () => ({
          iss: 'https://accounts.google.com',
          aud: 'unauthorized-client-id.apps.googleusercontent.com',
          exp: Math.floor(Date.now() / 1000) + 3600,
          email_verified: true,
          sub: '1234567890',
          email: 'user@example.com',
        }),
      }),
    };
    googleAuthService._setOAuth2Client(mockClientWrongAud);

    await assert.rejects(
      async () => {
        await googleAuthService.verifyGoogleIdToken('wrong-aud-token');
      },
      (err) => err.statusCode === 401 && err.message.includes('audience not authorized'),
      'Rejects unauthorized audience with 401'
    );
    console.log('  ✓ Unauthorized audience rejected with 401');

    // 3c. Expired token claim
    const mockClientExpired = {
      verifyIdToken: async () => ({
        getPayload: () => ({
          iss: 'https://accounts.google.com',
          aud: process.env.GOOGLE_CLIENT_ID_WEB,
          exp: Math.floor(Date.now() / 1000) - 100, // in the past
          email_verified: true,
          sub: '1234567890',
          email: 'user@example.com',
        }),
      }),
    };
    googleAuthService._setOAuth2Client(mockClientExpired);

    await assert.rejects(
      async () => {
        await googleAuthService.verifyGoogleIdToken('expired-token');
      },
      (err) => err.statusCode === 401 && err.message.includes('expired'),
      'Rejects expired token with 401'
    );
    console.log('  ✓ Expired token rejected with 401');

    // 3d. Invalid issuer
    const mockClientBadIss = {
      verifyIdToken: async () => ({
        getPayload: () => ({
          iss: 'https://untrusted-issuer.com',
          aud: process.env.GOOGLE_CLIENT_ID_WEB,
          exp: Math.floor(Date.now() / 1000) + 3600,
          email_verified: true,
          sub: '1234567890',
          email: 'user@example.com',
        }),
      }),
    };
    googleAuthService._setOAuth2Client(mockClientBadIss);

    await assert.rejects(
      async () => {
        await googleAuthService.verifyGoogleIdToken('bad-iss-token');
      },
      (err) => err.statusCode === 401 && err.message.includes('Invalid token issuer'),
      'Rejects invalid issuer with 401'
    );
    console.log('  ✓ Invalid issuer rejected with 401');

    // 3e. Unverified email claim
    const mockClientUnverifiedEmail = {
      verifyIdToken: async () => ({
        getPayload: () => ({
          iss: 'https://accounts.google.com',
          aud: process.env.GOOGLE_CLIENT_ID_WEB,
          exp: Math.floor(Date.now() / 1000) + 3600,
          email_verified: false,
          sub: '1234567890',
          email: 'unverified@example.com',
        }),
      }),
    };
    googleAuthService._setOAuth2Client(mockClientUnverifiedEmail);

    await assert.rejects(
      async () => {
        await googleAuthService.verifyGoogleIdToken('unverified-email-token');
      },
      (err) => err.statusCode === 401 && err.message.includes('not verified'),
      'Rejects unverified email with 401'
    );
    console.log('  ✓ Unverified email claim rejected with 401');

    // 3f. Missing sub claim
    const mockClientMissingSub = {
      verifyIdToken: async () => ({
        getPayload: () => ({
          iss: 'https://accounts.google.com',
          aud: process.env.GOOGLE_CLIENT_ID_WEB,
          exp: Math.floor(Date.now() / 1000) + 3600,
          email_verified: true,
          sub: '',
          email: 'user@example.com',
        }),
      }),
    };
    googleAuthService._setOAuth2Client(mockClientMissingSub);

    await assert.rejects(
      async () => {
        await googleAuthService.verifyGoogleIdToken('missing-sub-token');
      },
      (err) => err.statusCode === 401 && err.message.includes('missing subject'),
      'Rejects missing sub claim with 401'
    );
    console.log('  ✓ Missing sub claim rejected with 401');

    // -----------------------------------------------------------------
    // 4. Valid Token Verification & Route Authentication
    // -----------------------------------------------------------------
    console.log('\n--- 4. Testing Valid Token Verification & User Provisioning ---');
    const validTestSub = 'google-sub-' + Date.now();
    const validTestEmail = `google.user.${Date.now()}@example.com`;
    const validTestName = 'Google Verified Tester';

    const mockClientSuccess = {
      verifyIdToken: async () => ({
        getPayload: () => ({
          iss: 'https://accounts.google.com',
          aud: process.env.GOOGLE_CLIENT_ID_WEB,
          exp: Math.floor(Date.now() / 1000) + 3600,
          email_verified: true,
          sub: validTestSub,
          email: validTestEmail,
          name: validTestName,
        }),
      }),
    };
    googleAuthService._setOAuth2Client(mockClientSuccess);

    // Call POST /api/auth/google with the mocked valid token
    const validAuthRes = await app.inject({
      method: 'POST',
      url: '/api/auth/google',
      payload: { idToken: 'valid-mock-token' },
    });
    assert.strictEqual(validAuthRes.statusCode, 200, 'POST /api/auth/google returns 200 for valid token');
    const authData = JSON.parse(validAuthRes.payload).data;

    assert(authData.token, 'Issues Lunari session token');
    assert.strictEqual(authData.user.email, validTestEmail, 'User email matches verified Google identity');
    assert.strictEqual(authData.user.name, validTestName, 'User name matches verified Google identity');
    assert.strictEqual(authData.user.profile.average_cycle_length, 28, 'Default profile cycle length is 28');
    assert.strictEqual(authData.user.profile.onboarding_completed, false, 'Onboarding initially incomplete');
    console.log('  ✓ Valid token verified and user + profile created atomically');

    const googleUserId = authData.user.id;
    const sessionToken = authData.token;

    // Verify Lunari JWT token contents
    const decoded = verifyToken(sessionToken);
    assert.strictEqual(decoded.userId, googleUserId, 'Lunari token contains correct userId');
    console.log('  ✓ Lunari session JWT contains valid user identity');

    // Second sign-in with same `sub`: Finds existing account
    const secondAuthRes = await app.inject({
      method: 'POST',
      url: '/api/auth/google',
      payload: { idToken: 'valid-mock-token' },
    });
    assert.strictEqual(secondAuthRes.statusCode, 200, 'Second sign-in returns 200');
    const secondData = JSON.parse(secondAuthRes.payload).data;
    assert.strictEqual(secondData.user.id, googleUserId, 'Returns existing user account for same sub');
    console.log('  ✓ Existing account resolved using Google stable sub claim');

    // -----------------------------------------------------------------
    // 5. Conflict Protection: Avoid Auto-Linking Password Accounts
    // -----------------------------------------------------------------
    console.log('\n--- 5. Testing Protection Against Automatic Password Account Linking ---');
    const alphaUserRes = await query("SELECT email FROM users WHERE password_hash IS NOT NULL LIMIT 1");
    if (alphaUserRes.rows.length > 0) {
      const passwordAccountEmail = alphaUserRes.rows[0].email;
      const attackerSub = 'google-sub-attacker-' + Date.now();

      const mockClientAttacker = {
        verifyIdToken: async () => ({
          getPayload: () => ({
            iss: 'https://accounts.google.com',
            aud: process.env.GOOGLE_CLIENT_ID_WEB,
            exp: Math.floor(Date.now() / 1000) + 3600,
            email_verified: true,
            sub: attackerSub,
            email: passwordAccountEmail,
            name: 'Attacker Impersonator',
          }),
        }),
      };
      googleAuthService._setOAuth2Client(mockClientAttacker);

      const conflictRes = await app.inject({
        method: 'POST',
        url: '/api/auth/google',
        payload: { idToken: 'attacker-token' },
      });
      assert.strictEqual(conflictRes.statusCode, 409, 'POST /api/auth/google returns 409 on password account collision');
      assert(JSON.parse(conflictRes.payload).message.includes('password authentication'));
      console.log('  ✓ Existing password account protected from automatic Google linking (409 Conflict)');
    }

    // 5b. Attempting password login on a Google-only account
    const pwLoginGoogleAccountRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: validTestEmail,
        password: 'Password123!',
      },
    });
    assert.strictEqual(pwLoginGoogleAccountRes.statusCode, 400, 'Password login for Google-only user returns 400');
    const pwLoginGoogleData = JSON.parse(pwLoginGoogleAccountRes.payload);
    assert.strictEqual(pwLoginGoogleData.code, 'GOOGLE_SIGN_IN_REQUIRED', 'Returns GOOGLE_SIGN_IN_REQUIRED error code');
    assert(pwLoginGoogleData.message.includes('registered using Google Sign-In'), 'Message prompts user to sign in with Google');
    console.log('  ✓ Password login on Google-only account cleanly rejected with 400 and GOOGLE_SIGN_IN_REQUIRED');

    // -----------------------------------------------------------------
    // 6. Secure Account Linking (POST /api/auth/link-google)
    // -----------------------------------------------------------------
    console.log('\n--- 6. Testing Secure Account Linking (/api/auth/link-google) ---');

    // 6a. Unauthenticated linking attempt (no Bearer JWT)
    const unauthLinkRes = await app.inject({
      method: 'POST',
      url: '/api/auth/link-google',
      payload: { idToken: 'some-token' },
    });
    assert.strictEqual(unauthLinkRes.statusCode, 401, 'Unauthenticated link attempt rejected with 401');
    console.log('  ✓ Link attempt without JWT rejected with 401');

    // 6b. Register a new email/password account for linking tests
    const pwUserEmail = `link.test.${Date.now()}@example.com`;
    const pwUserPass = 'StrongPass123!';
    const pwUserName = 'Link Test User';

    const pwRegisterRes = await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: {
        email: pwUserEmail,
        password: pwUserPass,
        name: pwUserName,
      },
    });
    assert.strictEqual(pwRegisterRes.statusCode, 201, 'Password account registration returns 201');
    const pwUserData = JSON.parse(pwRegisterRes.payload).data;
    const pwSessionToken = pwUserData.token;
    const pwUserId = pwUserData.user.id;

    assert.strictEqual(pwUserData.user.has_password, true, 'Initially has_password is true');
    assert.strictEqual(pwUserData.user.is_google_linked, false, 'Initially is_google_linked is false');
    assert.deepStrictEqual(pwUserData.user.auth_providers, ['email'], 'Initially auth_providers is [email]');
    console.log('  ✓ Created test email/password user for linking flow');

    // 6c. Missing Google ID token in link request
    const missingTokenLinkRes = await app.inject({
      method: 'POST',
      url: '/api/auth/link-google',
      headers: { authorization: `Bearer ${pwSessionToken}` },
      payload: {},
    });
    assert.strictEqual(missingTokenLinkRes.statusCode, 400, 'Link request missing ID token returns 400');
    console.log('  ✓ Missing ID token rejected with 400');

    // 6d. Email mismatch: Token email does not match authenticated user email
    const mismatchSub = 'google-sub-mismatch-' + Date.now();
    const mockClientMismatch = {
      verifyIdToken: async () => ({
        getPayload: () => ({
          iss: 'https://accounts.google.com',
          aud: process.env.GOOGLE_CLIENT_ID_WEB,
          exp: Math.floor(Date.now() / 1000) + 3600,
          email_verified: true,
          sub: mismatchSub,
          email: 'different.email@example.com',
          name: 'Different Email',
        }),
      }),
    };
    googleAuthService._setOAuth2Client(mockClientMismatch);

    const mismatchLinkRes = await app.inject({
      method: 'POST',
      url: '/api/auth/link-google',
      headers: { authorization: `Bearer ${pwSessionToken}` },
      payload: { idToken: 'mismatched-email-token' },
    });
    assert.strictEqual(mismatchLinkRes.statusCode, 400, 'Email mismatch rejected with 400');
    const mismatchData = JSON.parse(mismatchLinkRes.payload);
    assert.strictEqual(mismatchData.code, 'EMAIL_MISMATCH', 'Returns EMAIL_MISMATCH code');
    console.log('  ✓ Account linking rejects email mismatch with 400 EMAIL_MISMATCH');

    // 6e. Google sub already linked to another user
    const mockClientSubConflict = {
      verifyIdToken: async () => ({
        getPayload: () => ({
          iss: 'https://accounts.google.com',
          aud: process.env.GOOGLE_CLIENT_ID_WEB,
          exp: Math.floor(Date.now() / 1000) + 3600,
          email_verified: true,
          sub: validTestSub, // Already linked to user created in step 4
          email: pwUserEmail,
          name: pwUserName,
        }),
      }),
    };
    googleAuthService._setOAuth2Client(mockClientSubConflict);

    const subConflictRes = await app.inject({
      method: 'POST',
      url: '/api/auth/link-google',
      headers: { authorization: `Bearer ${pwSessionToken}` },
      payload: { idToken: 'conflicting-sub-token' },
    });
    assert.strictEqual(subConflictRes.statusCode, 409, 'Conflicting sub returns 409');
    const subConflictData = JSON.parse(subConflictRes.payload);
    assert.strictEqual(subConflictData.code, 'GOOGLE_ACCOUNT_ALREADY_LINKED', 'Returns GOOGLE_ACCOUNT_ALREADY_LINKED code');
    console.log('  ✓ Account linking rejects already-linked Google identity with 409 GOOGLE_ACCOUNT_ALREADY_LINKED');

    // 6f. Successful Google Account Linking
    const validLinkSub = 'google-sub-linked-' + Date.now();
    const mockClientLinkSuccess = {
      verifyIdToken: async () => ({
        getPayload: () => ({
          iss: 'https://accounts.google.com',
          aud: process.env.GOOGLE_CLIENT_ID_WEB,
          exp: Math.floor(Date.now() / 1000) + 3600,
          email_verified: true,
          sub: validLinkSub,
          email: pwUserEmail,
          name: pwUserName,
        }),
      }),
    };
    googleAuthService._setOAuth2Client(mockClientLinkSuccess);

    const successfulLinkRes = await app.inject({
      method: 'POST',
      url: '/api/auth/link-google',
      headers: { authorization: `Bearer ${pwSessionToken}` },
      payload: { idToken: 'valid-linking-token' },
    });
    assert.strictEqual(successfulLinkRes.statusCode, 200, 'Successful link returns 200');
    const linkResultData = JSON.parse(successfulLinkRes.payload).data.user;
    assert.strictEqual(linkResultData.id, pwUserId, 'Preserves user ID');
    assert.strictEqual(linkResultData.has_password, true, 'has_password remains true');
    assert.strictEqual(linkResultData.is_google_linked, true, 'is_google_linked is now true');
    assert.deepStrictEqual(linkResultData.auth_providers, ['email', 'google'], 'auth_providers includes both email and google');
    console.log('  ✓ Account linking succeeded with both email and google providers active');

    // 6g. Verify multi-provider authentication after linking
    // Can log in with Google
    const googleLoginLinkedRes = await app.inject({
      method: 'POST',
      url: '/api/auth/google',
      payload: { idToken: 'valid-linking-token' },
    });
    assert.strictEqual(googleLoginLinkedRes.statusCode, 200, 'Linked user can log in with Google');
    const googleLoginLinkedData = JSON.parse(googleLoginLinkedRes.payload).data;
    assert.strictEqual(googleLoginLinkedData.user.id, pwUserId, 'Google login resolves to original account ID');
    assert.strictEqual(googleLoginLinkedData.user.has_password, true, 'User still has password');
    assert.strictEqual(googleLoginLinkedData.user.is_google_linked, true, 'User is Google linked');
    console.log('  ✓ Linked user successfully logs in via Google');

    // Can still log in with email/password
    const pwLoginLinkedRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: pwUserEmail,
        password: pwUserPass,
      },
    });
    assert.strictEqual(pwLoginLinkedRes.statusCode, 200, 'Linked user can log in with email and password');
    const pwLoginLinkedData = JSON.parse(pwLoginLinkedRes.payload).data;
    assert.strictEqual(pwLoginLinkedData.user.id, pwUserId, 'Password login resolves to original account ID');
    assert.strictEqual(pwLoginLinkedData.user.has_password, true, 'User has password');
    assert.strictEqual(pwLoginLinkedData.user.is_google_linked, true, 'User is Google linked');
    assert.deepStrictEqual(pwLoginLinkedData.user.auth_providers, ['email', 'google'], 'Both providers returned');
    console.log('  ✓ Linked user successfully logs in via Password');

    // -----------------------------------------------------------------
    // 7. Protected Endpoint Access & Logout with Issued Lunari Token
    // -----------------------------------------------------------------
    console.log('\n--- 7. Testing Protected Endpoints & Logout with Issued Token ---');
    const meRes = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: {
        authorization: `Bearer ${sessionToken}`,
      },
    });
    assert.strictEqual(meRes.statusCode, 200, 'GET /api/auth/me returns 200 for Google user');
    const meData = JSON.parse(meRes.payload).data.user;
    assert.strictEqual(meData.id, googleUserId, 'GET /api/auth/me returns correct Google user ID');
    assert.strictEqual(meData.has_password, false, 'Google-only user has_password is false');
    assert.strictEqual(meData.is_google_linked, true, 'Google-only user is_google_linked is true');
    assert.deepStrictEqual(meData.auth_providers, ['google'], 'Google-only user auth_providers is [google]');
    console.log('  ✓ Protected /api/auth/me accessible with issued Lunari session token and accurate provider info');

    const logoutRes = await app.inject({
      method: 'POST',
      url: '/api/auth/logout',
      headers: {
        authorization: `Bearer ${sessionToken}`,
      },
    });
    assert.strictEqual(logoutRes.statusCode, 200, 'POST /api/auth/logout returns 200');
    console.log('  ✓ Logout succeeds for Google user');

    const afterLogoutRes = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: {
        authorization: `Bearer ${sessionToken}`,
      },
    });
    assert.strictEqual(afterLogoutRes.statusCode, 401, 'Revoked token rejected after logout');
    console.log('  ✓ Token properly revoked on server after logout');

    // Restore official OAuth2Client
    googleAuthService._setOAuth2Client(new OAuth2Client());

    console.log('\n====================================================');
    console.log(' All Google Auth Tests Passed Successfully!');
    console.log('====================================================');
  } finally {
      await app.close();
  }
}

runGoogleAuthTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Test suite failed:', err);
    process.exit(1);
  });
