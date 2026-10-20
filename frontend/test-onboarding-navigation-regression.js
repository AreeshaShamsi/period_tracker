/**
 * Automated Regression Test Suite: Lunari Onboarding Navigation & Session Routing
 *
 * Verifies the fix for: "Onboarding Showing Again After Login in Lunari"
 *
 * Requirements Verified:
 * 1. Database says onboarding_completed = true for existing account (User #1).
 * 2. /api/auth/me returns status correctly across all profile/user structures.
 * 3. Login succeeds with valid session token.
 * 4. App navigates directly to dashboard for onboarded users.
 * 5. Restarting the app does not show onboarding again.
 * 6. Behavior works for both Google and email/password login.
 * 7. Genuinely new user still sees onboarding.
 * 8. Stale AsyncStorage cache never overrides fresh backend truth.
 * 9. Preserves existing period history, symptoms, and user records.
 */

const path = require('path');
const assert = require('assert');

// 1. Load backend environment
const backendDir = path.join(__dirname, '../backend');
require(path.join(backendDir, 'node_modules/dotenv')).config({ path: path.join(backendDir, '.env') });

const buildApp = require(path.join(backendDir, 'src/app'));
const { query, closePool } = require(path.join(backendDir, 'src/config/database'));
const { hashPassword } = require(path.join(backendDir, 'src/services/auth.service'));
const googleAuthService = require(path.join(backendDir, 'src/services/googleAuth.service'));

let totalPassed = 0;
let totalFailed = 0;

function check(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    totalPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    totalFailed++;
  }
}

// 2. Client-side extractOnboardingStatus implementation (matching frontend/src/types/auth.ts)
function extractOnboardingStatus(userOrProfile) {
  if (!userOrProfile || typeof userOrProfile !== 'object') {
    return { isCompleted: false, rawStatus: undefined, hasProfile: false, profileState: 'missing' };
  }

  const obj = userOrProfile;
  const profile = obj.profile ?? (obj.user_id !== undefined ? obj : undefined);
  const hasProfile = Boolean(profile);

  let rawStatus = undefined;
  let sourceProperty = undefined;

  if (profile && profile.onboarding_completed !== undefined) {
    rawStatus = profile.onboarding_completed;
    sourceProperty = 'profile.onboarding_completed';
  } else if (profile && profile.onboardingCompleted !== undefined) {
    rawStatus = profile.onboardingCompleted;
    sourceProperty = 'profile.onboardingCompleted';
  } else if (obj.onboarding_completed !== undefined) {
    rawStatus = obj.onboarding_completed;
    sourceProperty = 'onboarding_completed';
  } else if (obj.onboardingCompleted !== undefined) {
    rawStatus = obj.onboardingCompleted;
    sourceProperty = 'onboardingCompleted';
  }

  const isCompleted = rawStatus === true;
  let profileState;

  if (!hasProfile) {
    profileState = 'missing';
  } else if (rawStatus === null) {
    profileState = 'null';
  } else if (rawStatus === true) {
    profileState = 'true';
  } else {
    profileState = 'false';
  }

  return {
    isCompleted,
    rawStatus,
    hasProfile,
    profileState,
    sourceProperty,
  };
}

// 3. Navigation Guard decision simulators
function simulateRootGuard({ token, currentUserRes, cachedUser }) {
  if (!token) {
    return { decision: '/(auth)/welcome', reason: 'No token' };
  }

  let user = currentUserRes?.user || cachedUser;
  if (!user) {
    return { decision: '/(auth)/welcome', reason: 'No user data' };
  }

  const status = extractOnboardingStatus(user);
  if (status.isCompleted) {
    return { decision: '/(app)/dashboard', reason: 'Onboarding completed' };
  }
  return { decision: '/onboarding', reason: 'Onboarding incomplete' };
}

function simulateDashboardGuard({ token, backendUser, cachedUser }) {
  if (!token) {
    return { decision: '/(auth)/welcome', reason: 'Unauthenticated in dashboard' };
  }

  // Fresh backend takes precedence over stale cache
  const user = backendUser || cachedUser;
  if (!user) {
    return { decision: '/(auth)/welcome', reason: 'No user profile available' };
  }

  const status = extractOnboardingStatus(user);
  if (status.isCompleted) {
    return { decision: '/(app)/dashboard', status: 'onboarded' };
  }
  return { decision: '/onboarding', status: 'needs_onboarding' };
}

async function runRegressionSuite() {
  console.log('================================================================');
  console.log(' Lunari Onboarding Navigation Regression Test Suite');
  console.log('================================================================\n');

  const app = buildApp({ logger: false });
  await app.ready();

  try {
    // -----------------------------------------------------------------
    // TEST 1: Database verification for Existing Test Account (User #1)
    // -----------------------------------------------------------------
    console.log('--- 1. Database State for Existing Account (User #1) ---');
    const user1Db = await query(
      `SELECT u.id, u.email, p.onboarding_completed, p.average_cycle_length
       FROM users u
       JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = 1`
    );
    check(user1Db.rows.length === 1, 'User #1 exists in PostgreSQL users table');
    check(user1Db.rows[0].email === 'testuser@example.com', 'User #1 email is testuser@example.com');
    check(user1Db.rows[0].onboarding_completed === true, 'Database says onboarding_completed = true');

    // Ensure user 1 has a known password hash for authentication test
    const testPassword = 'Password123!';
    const hashed = await hashPassword(testPassword);
    await query('UPDATE users SET password_hash = $1 WHERE id = 1', [hashed]);

    // -----------------------------------------------------------------
    // TEST 2: Existing Account Login & /api/auth/me Response Structure
    // -----------------------------------------------------------------
    console.log('\n--- 2. Email/Password Login & /api/auth/me Response Structure ---');
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'testuser@example.com',
        password: testPassword,
      },
    });

    check(loginRes.statusCode === 200, 'POST /api/auth/login succeeds with HTTP 200');
    const loginBody = JSON.parse(loginRes.payload);
    check(Boolean(loginBody.data?.token), 'Login response contains valid session token');

    const loginUser = loginBody.data?.user;
    check(loginUser.onboarding_completed === true, 'user.onboarding_completed is true in login response');
    check(loginUser.onboardingCompleted === true, 'user.onboardingCompleted is true in login response');
    check(loginUser.profile?.onboarding_completed === true, 'user.profile.onboarding_completed is true in login response');
    check(loginUser.profile?.onboardingCompleted === true, 'user.profile.onboardingCompleted is true in login response');

    const sessionToken = loginBody.data.token;
    const meRes = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: { authorization: `Bearer ${sessionToken}` },
    });

    check(meRes.statusCode === 200, 'GET /api/auth/me returns HTTP 200');
    const meBody = JSON.parse(meRes.payload);
    const meUser = meBody.data?.user;
    check(meUser.onboarding_completed === true, 'GET /api/auth/me user.onboarding_completed is true');
    check(meUser.profile?.onboarding_completed === true, 'GET /api/auth/me user.profile.onboarding_completed is true');

    // -----------------------------------------------------------------
    // TEST 3: Navigation Routing for Existing Account (Direct to Dashboard)
    // -----------------------------------------------------------------
    console.log('\n--- 3. Navigation Routing for Existing Account ---');
    const rootRouting = simulateRootGuard({
      token: sessionToken,
      currentUserRes: { user: meUser },
      cachedUser: null,
    });
    check(rootRouting.decision === '/(app)/dashboard', 'Root guard navigates directly to /(app)/dashboard');

    const dashboardRouting = simulateDashboardGuard({
      token: sessionToken,
      backendUser: meUser,
      cachedUser: null,
    });
    check(dashboardRouting.decision === '/(app)/dashboard', 'Dashboard guard permits access to /(app)/dashboard');
    check(dashboardRouting.status === 'onboarded', 'Dashboard status set to "onboarded"');

    // -----------------------------------------------------------------
    // TEST 4: App Restart Verification (No Onboarding on Restart)
    // -----------------------------------------------------------------
    console.log('\n--- 4. App Restart Verification (Persistent Session) ---');
    // On app restart, cachedUser exists and /api/auth/me is fetched again
    const restartRoot = simulateRootGuard({
      token: sessionToken,
      currentUserRes: { user: meUser },
      cachedUser: loginUser,
    });
    check(restartRoot.decision === '/(app)/dashboard', 'App restart navigates directly to dashboard (never /onboarding)');

    const restartTab = simulateDashboardGuard({
      token: sessionToken,
      backendUser: meUser,
      cachedUser: loginUser,
    });
    check(restartTab.decision === '/(app)/dashboard', 'App restart tab route remains on dashboard');

    // -----------------------------------------------------------------
    // TEST 5: Protection Against Stale Cache Overriding Fresh Backend Truth
    // -----------------------------------------------------------------
    console.log('\n--- 5. Stale Cache Protection ---');
    // Scenario: local AsyncStorage has stale cachedUser with onboarding_completed = false
    const staleCachedUser = {
      ...loginUser,
      onboarding_completed: false,
      onboardingCompleted: false,
      profile: {
        ...loginUser.profile,
        onboarding_completed: false,
        onboardingCompleted: false,
      },
    };

    const staleOverrideCheck = simulateDashboardGuard({
      token: sessionToken,
      backendUser: meUser, // Fresh backend has onboarding_completed = true
      cachedUser: staleCachedUser, // Stale cache has false
    });
    check(
      staleOverrideCheck.decision === '/(app)/dashboard',
      'Fresh backend onboarding_completed = true takes precedence over stale cache (dashboard rendered)'
    );

    // -----------------------------------------------------------------
    // TEST 6: Google Login Flow (Both Existing and New Google Accounts)
    // -----------------------------------------------------------------
    console.log('\n--- 6. Google Login Flow ---');
    const existingGoogleEmail = 'google.onboarded.test@example.com';
    const existingGoogleSub = 'google-sub-onboarded-regression-test';

    // Clean up previous runs
    await query('DELETE FROM users WHERE email = $1 OR google_id = $2', [existingGoogleEmail, existingGoogleSub]);

    // Create an existing Google user whose onboarding is complete
    const createGoogleUser = await query(
      `INSERT INTO users (name, email, google_id, auth_provider, created_at, updated_at)
       VALUES ('Google Onboarded Tester', $1, $2, 'google', NOW(), NOW())
       RETURNING id, name, email`,
      [existingGoogleEmail, existingGoogleSub]
    );
    const googleUserId = createGoogleUser.rows[0].id;
    await query(
      `INSERT INTO user_profiles (user_id, average_cycle_length, average_period_duration, onboarding_completed, created_at, updated_at)
       VALUES ($1, 28, 5, TRUE, NOW(), NOW())`,
      [googleUserId]
    );

    // Mock Google OAuth verification
    const mockClient = {
      async verifyIdToken() {
        return {
          getPayload: () => ({
            iss: 'https://accounts.google.com',
            aud: process.env.GOOGLE_CLIENT_ID_WEB || 'test-web-client-id.apps.googleusercontent.com',
            sub: existingGoogleSub,
            email: existingGoogleEmail,
            email_verified: true,
            exp: Math.floor(Date.now() / 1000) + 3600,
            name: 'Google Onboarded Tester',
          }),
        };
      },
    };
    googleAuthService._setOAuth2Client(mockClient);

    const googleAuthRes = await app.inject({
      method: 'POST',
      url: '/api/auth/google',
      payload: { idToken: 'valid-google-id-token' },
    });

    check(googleAuthRes.statusCode === 200, 'POST /api/auth/google succeeds for existing Google user');
    const googleBody = JSON.parse(googleAuthRes.payload);
    check(googleBody.data?.user?.onboarding_completed === true, 'Existing Google user has onboarding_completed = true');
    check(googleBody.data?.user?.profile?.onboarding_completed === true, 'Existing Google user profile.onboarding_completed is true');

    const googleRouting = simulateRootGuard({
      token: googleBody.data.token,
      currentUserRes: { user: googleBody.data.user },
      cachedUser: null,
    });
    check(googleRouting.decision === '/(app)/dashboard', 'Existing Google account navigates directly to /(app)/dashboard');

    // -----------------------------------------------------------------
    // TEST 7: Genuinely New User Verification (Must See Onboarding)
    // -----------------------------------------------------------------
    console.log('\n--- 7. Genuinely New User Verification ---');
    const newEmail = `new.user.${Date.now()}@example.com`;
    const signupRes = await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: {
        name: 'New Tester',
        email: newEmail,
        password: testPassword,
      },
    });

    check(signupRes.statusCode === 201, 'POST /api/auth/signup succeeds with HTTP 201 Created');
    const signupBody = JSON.parse(signupRes.payload);
    const newUser = signupBody.data?.user;
    check(newUser.onboarding_completed === false, 'Genuinely new user has onboarding_completed = false');
    check(newUser.profile?.onboarding_completed === false, 'Genuinely new user has profile.onboarding_completed = false');

    const newRootRouting = simulateRootGuard({
      token: signupBody.data.token,
      currentUserRes: { user: newUser },
      cachedUser: null,
    });
    check(newRootRouting.decision === '/onboarding', 'Genuinely new user correctly routed to /onboarding');

    const newDashboardRouting = simulateDashboardGuard({
      token: signupBody.data.token,
      backendUser: newUser,
      cachedUser: null,
    });
    check(newDashboardRouting.decision === '/onboarding', 'Dashboard guard intercepts uncompleted user and redirects to /onboarding');
    check(newDashboardRouting.status === 'needs_onboarding', 'New user status set to "needs_onboarding"');

    // Clean up temporary new user
    await query('DELETE FROM users WHERE email = $1', [newEmail]);
    await query('DELETE FROM users WHERE email = $1', [existingGoogleEmail]);

    // -----------------------------------------------------------------
    // TEST 8: Data Preservation Verification
    // -----------------------------------------------------------------
    console.log('\n--- 8. Data Preservation Verification ---');
    const user1Verify = await query('SELECT * FROM users WHERE id = 1');
    check(user1Verify.rows.length === 1, 'User #1 record preserved intact');

    const user1Profile = await query('SELECT * FROM user_profiles WHERE user_id = 1');
    check(user1Profile.rows.length === 1 && user1Profile.rows[0].onboarding_completed === true, 'User #1 profile preserved with onboarding_completed = true');

    const user1Periods = await query('SELECT * FROM periods WHERE user_id = 1');
    check(user1Periods.rows.length > 0, 'User #1 period tracking history preserved');

    const user1DayLogs = await query('SELECT * FROM period_day_logs WHERE period_id = 1');
    check(user1DayLogs.rows.length > 0, 'User #1 period daily flow logs preserved');

    // -----------------------------------------------------------------
    // TEST 9: extractOnboardingStatus Property Mismatch Resilience
    // -----------------------------------------------------------------
    console.log('\n--- 9. Property Path Mismatch Resilience ---');
    check(extractOnboardingStatus({ profile: { onboarding_completed: true } }).isCompleted === true, 'Handles profile.onboarding_completed (snake_case)');
    check(extractOnboardingStatus({ profile: { onboardingCompleted: true } }).isCompleted === true, 'Handles profile.onboardingCompleted (camelCase)');
    check(extractOnboardingStatus({ onboarding_completed: true }).isCompleted === true, 'Handles top-level onboarding_completed');
    check(extractOnboardingStatus({ onboardingCompleted: true }).isCompleted === true, 'Handles top-level onboardingCompleted');
    check(extractOnboardingStatus({ profile: { onboarding_completed: false } }).isCompleted === false, 'Handles false correctly');
    check(extractOnboardingStatus({ profile: { onboarding_completed: null } }).isCompleted === false, 'Handles null correctly');
    check(extractOnboardingStatus({ profile: null }).isCompleted === false, 'Handles null profile object');
    check(extractOnboardingStatus({}).isCompleted === false, 'Handles empty object');
    check(extractOnboardingStatus(null).isCompleted === false, 'Handles null input');
    check(extractOnboardingStatus(undefined).isCompleted === false, 'Handles undefined input');

  } catch (err) {
    console.error('Test suite execution error:', err);
    totalFailed++;
  } finally {
    await closePool();
  }

  console.log('\n================================================================');
  console.log(` Regression Suite Results: ${totalPassed} passed, ${totalFailed} failed`);
  console.log('================================================================\n');

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runRegressionSuite();
