/**
 * Automated Test Suite for Lunari Backend API - Phase 1
 * Tests all authentication, profile, period, daily flow, symptom, cycle, and calendar endpoints.
 * Validates constraints, error handling, session invalidation, and cross-user isolation.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const buildApp = require('./src/app');
const { pool, query, closePool } = require('./src/config/database');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log(' Lunari Phase 1 API Automated Test Suite');
  console.log('====================================================\n');

  const app = buildApp({ logger: false });
  await app.ready();

  const userAlphaEmail = 'test_user_alpha_phase1@example.com';
  const userBetaEmail = 'test_user_beta_phase1@example.com';
  const userGammaEmail = 'test_user_gamma_onboarding@example.com';

  try {
    // 0. Clean up any previous test runs for test users (preserving User 1 intact)
    await query('DELETE FROM users WHERE email IN ($1, $2, $3)', [userAlphaEmail, userBetaEmail, userGammaEmail]);

    // Verify sample user 1 exists before testing
    const sampleUserCheck = await query('SELECT id, email FROM users WHERE id = 1');
    assert(sampleUserCheck.rows.length === 1, 'Sample User (id: 1) is present in database');

    // -------------------------------------------------------------
    // SECTION 1: Health Endpoints
    // -------------------------------------------------------------
    console.log('\n--- 1. Health Endpoints ---');
    const rootRes = await app.inject({ method: 'GET', url: '/' });
    assert(rootRes.statusCode === 200, 'GET / returns 200 OK');

    const healthRes = await app.inject({ method: 'GET', url: '/api/health' });
    assert(healthRes.statusCode === 200 && JSON.parse(healthRes.payload).status === 'ok', 'GET /api/health returns 200 ok');

    const dbHealthRes = await app.inject({ method: 'GET', url: '/api/health/db' });
    assert(dbHealthRes.statusCode === 200 && JSON.parse(dbHealthRes.payload).database.connected === true, 'GET /api/health/db returns 200 connected');

    // -------------------------------------------------------------
    // SECTION 2: Authentication APIs
    // -------------------------------------------------------------
    console.log('\n--- 2. Authentication APIs ---');

    // Signup validation errors
    const invalidSignup1 = await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: { name: '', email: 'bademail', password: '123' },
    });
    assert(invalidSignup1.statusCode === 400, 'POST /api/auth/signup rejects empty name and short password with 400');

    // Successful signup for Alpha
    const signupRes = await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: {
        name: 'Alpha Tester',
        email: userAlphaEmail,
        password: 'Password123!',
        birthYear: 1996,
        averageCycleLength: 30,
        averagePeriodDuration: 5,
      },
    });
    assert(signupRes.statusCode === 201, 'POST /api/auth/signup creates user with 201 Created');
    const signupData = JSON.parse(signupRes.payload).data;
    assert(Boolean(signupData.token), 'Signup response includes auth token');
    assert(signupData.user.email === userAlphaEmail, 'Signup response returns normalized email');
    assert(signupData.user.profile.average_cycle_length === 30, 'Signup sets custom average cycle length');

    let tokenAlpha = signupData.token;
    const userAlphaId = signupData.user.id;

    // Duplicate signup
    const dupSignup = await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: {
        name: 'Alpha Clone',
        email: userAlphaEmail,
        password: 'Password123!',
      },
    });
    assert(dupSignup.statusCode === 409, 'POST /api/auth/signup rejects duplicate email with 409 Conflict');

    // Login with invalid password
    const badLogin = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: userAlphaEmail, password: 'WrongPassword' },
    });
    assert(badLogin.statusCode === 401, 'POST /api/auth/login rejects incorrect password with 401');

    // Successful login
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: userAlphaEmail, password: 'Password123!' },
    });
    assert(loginRes.statusCode === 200, 'POST /api/auth/login succeeds with 200 OK');
    tokenAlpha = JSON.parse(loginRes.payload).data.token;

    // Protected route /api/auth/me without token
    const unauthMe = await app.inject({ method: 'GET', url: '/api/auth/me' });
    assert(unauthMe.statusCode === 401, 'GET /api/auth/me without token returns 401');

    // Protected route /api/auth/me with valid token
    const meRes = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: { authorization: `Bearer ${tokenAlpha}` },
    });
    assert(meRes.statusCode === 200, 'GET /api/auth/me with Bearer token returns 200');
    assert(JSON.parse(meRes.payload).data.user.id === userAlphaId, 'GET /api/auth/me returns authenticated user ID');

    // Server-side logout and token revocation
    const logoutRes = await app.inject({
      method: 'POST',
      url: '/api/auth/logout',
      headers: { authorization: `Bearer ${tokenAlpha}` },
    });
    assert(logoutRes.statusCode === 200, 'POST /api/auth/logout returns 200 OK');

    // Verify revoked token cannot access protected endpoint
    const afterLogoutMe = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: { authorization: `Bearer ${tokenAlpha}` },
    });
    assert(afterLogoutMe.statusCode === 401, 'Revoked token rejected with 401 after logout');

    // Re-login to get active token for subsequent tests
    const relogin = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: userAlphaEmail, password: 'Password123!' },
    });
    tokenAlpha = JSON.parse(relogin.payload).data.token;

    // -------------------------------------------------------------
    // SECTION 3: Profile & Notification Preferences APIs
    // -------------------------------------------------------------
    console.log('\n--- 3. Profile APIs ---');

    const getProfileRes = await app.inject({
      method: 'GET',
      url: '/api/profile',
      headers: { authorization: `Bearer ${tokenAlpha}` },
    });
    assert(getProfileRes.statusCode === 200, 'GET /api/profile returns 200');

    // Update with invalid constraints
    const badProfileUpdate = await app.inject({
      method: 'PUT',
      url: '/api/profile',
      headers: { authorization: `Bearer ${tokenAlpha}` },
      payload: { average_cycle_length: 10 }, // constraint: >= 15
    });
    assert(badProfileUpdate.statusCode === 400, 'PUT /api/profile rejects cycle length < 15 with 400');

    // Valid profile update
    const validProfileUpdate = await app.inject({
      method: 'PUT',
      url: '/api/profile',
      headers: { authorization: `Bearer ${tokenAlpha}` },
      payload: {
        name: 'Alpha Updated',
        average_cycle_length: 29,
        average_period_duration: 6,
        onboarding_completed: true,
      },
    });
    assert(validProfileUpdate.statusCode === 200, 'PUT /api/profile updates profile with 200');
    const updatedProf = JSON.parse(validProfileUpdate.payload).data.profile;
    assert(updatedProf.name === 'Alpha Updated', 'Profile name updated in users table');
    assert(updatedProf.average_cycle_length === 29, 'average_cycle_length updated in user_profiles');
    assert(updatedProf.onboarding_completed === true, 'onboarding_completed set to true');

    // Notification preferences placeholder
    const notifGet = await app.inject({
      method: 'GET',
      url: '/api/notifications/preferences',
      headers: { authorization: `Bearer ${tokenAlpha}` },
    });
    assert(notifGet.statusCode === 501, 'GET /api/notifications/preferences returns 501 Not Implemented per scope');

    // --- Onboarding Completion Flow ---
    const gammaSignup = await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: {
        name: 'Gamma Initial',
        email: userGammaEmail,
        password: 'Password123!',
      },
    });
    assert(gammaSignup.statusCode === 201, 'Signup creates Gamma user');
    const gammaData = JSON.parse(gammaSignup.payload).data;
    const tokenGamma = gammaData.token;
    assert(gammaData.user.profile.onboarding_completed === false, 'New user has onboarding_completed = false');

    // Reject onboarding with invalid constraints (e.g. cycle length < 15)
    const invalidOnboarding = await app.inject({
      method: 'POST',
      url: '/api/profile/onboarding',
      headers: { authorization: `Bearer ${tokenGamma}` },
      payload: {
        name: 'Gamma Onboarded',
        averageCycleLength: 10,
      },
    });
    assert(invalidOnboarding.statusCode === 400, 'POST /api/profile/onboarding rejects invalid cycle length with 400');

    // Complete onboarding with full data
    const completeOnboardingRes = await app.inject({
      method: 'POST',
      url: '/api/profile/onboarding',
      headers: { authorization: `Bearer ${tokenGamma}` },
      payload: {
        name: 'Gamma Full Onboarded',
        birthYear: 1999,
        averageCycleLength: 28,
        averagePeriodDuration: 5,
        lastPeriodDays: ['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-09-05'],
      },
    });
    assert(completeOnboardingRes.statusCode === 200, 'POST /api/profile/onboarding returns 200 OK');
    const onboardedProfile = JSON.parse(completeOnboardingRes.payload).data.profile;
    assert(onboardedProfile.name === 'Gamma Full Onboarded', 'User name updated on onboarding completion');
    assert(onboardedProfile.onboarding_completed === true, 'Profile onboarding_completed set to true');
    assert(onboardedProfile.birth_year === 1999, 'birth_year saved');
    assert(onboardedProfile.average_cycle_length === 28, 'average_cycle_length saved');

    // Verify DB records for periods & period_days
    const gammaPeriods = await query('SELECT * FROM periods WHERE user_id = $1', [gammaData.user.id]);
    assert(gammaPeriods.rows.length === 1, 'Initial period record created in periods table');
    assert(String(gammaPeriods.rows[0].start_date).slice(0, 10) === '2026-09-01', 'Period start_date matches first day');
    assert(String(gammaPeriods.rows[0].end_date).slice(0, 10) === '2026-09-05', 'Period end_date matches last day');

    const gammaPeriodDays = await query('SELECT * FROM period_day_logs WHERE period_id = $1 ORDER BY log_date ASC', [gammaPeriods.rows[0].id]);
    assert(gammaPeriodDays.rows.length === 5, '5 period_day_logs records created');

    // Idempotent test: Call onboarding completion again without error
    const duplicateOnboarding = await app.inject({
      method: 'POST',
      url: '/api/profile/onboarding',
      headers: { authorization: `Bearer ${tokenGamma}` },
      payload: {
        name: 'Gamma Full Onboarded',
        birthYear: 1999,
        averageCycleLength: 28,
        averagePeriodDuration: 5,
        lastPeriodDays: ['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-09-05'],
      },
    });
    assert(duplicateOnboarding.statusCode === 200, 'POST /api/profile/onboarding handles repeat calls gracefully (idempotent)');

    // Test PATCH /api/profile
    const patchProfileRes = await app.inject({
      method: 'PATCH',
      url: '/api/profile',
      headers: { authorization: `Bearer ${tokenGamma}` },
      payload: {
        name: 'Gamma Patched',
        average_cycle_length: 31,
      },
    });
    assert(patchProfileRes.statusCode === 200, 'PATCH /api/profile updates profile');
    const patchedProfile = JSON.parse(patchProfileRes.payload).data.profile;
    assert(patchedProfile.name === 'Gamma Patched', 'PATCH /api/profile updated name');
    assert(patchedProfile.average_cycle_length === 31, 'PATCH /api/profile updated average_cycle_length');
    assert(patchedProfile.onboarding_completed === true, 'onboarding_completed remains true');

    // -------------------------------------------------------------
    // SECTION 4: Period APIs
    // -------------------------------------------------------------
    console.log('\n--- 4. Period APIs ---');

    // Create period with invalid end_date < start_date
    const badPeriodRes = await app.inject({
      method: 'POST',
      url: '/api/periods',
      headers: { authorization: `Bearer ${tokenAlpha}` },
      payload: { start_date: '2026-09-10', end_date: '2026-09-05' },
    });
    assert(badPeriodRes.statusCode === 400, 'POST /api/periods rejects end_date < start_date with 400');

    // Create ongoing period (end_date: null)
    const ongoingPeriodRes = await app.inject({
      method: 'POST',
      url: '/api/periods',
      headers: { authorization: `Bearer ${tokenAlpha}` },
      payload: { start_date: '2026-09-01', end_date: null, notes: 'Ongoing September cycle' },
    });
    assert(ongoingPeriodRes.statusCode === 201, 'POST /api/periods creates ongoing period with 201');
    const periodAlpha1 = JSON.parse(ongoingPeriodRes.payload).data.period;
    assert(periodAlpha1.is_ongoing === true, 'Period marked as is_ongoing: true');

    // Duplicate start_date for same user
    const dupPeriodRes = await app.inject({
      method: 'POST',
      url: '/api/periods',
      headers: { authorization: `Bearer ${tokenAlpha}` },
      payload: { start_date: '2026-09-01' },
    });
    assert(dupPeriodRes.statusCode === 409, 'POST /api/periods rejects duplicate start_date with 409 Conflict');

    // Create completed second period
    const completedPeriodRes = await app.inject({
      method: 'POST',
      url: '/api/periods',
      headers: { authorization: `Bearer ${tokenAlpha}` },
      payload: { start_date: '2026-10-01', end_date: '2026-10-06', notes: 'October cycle' },
    });
    assert(completedPeriodRes.statusCode === 201, 'POST /api/periods creates completed period with 201');
    const periodAlpha2 = JSON.parse(completedPeriodRes.payload).data.period;
    assert(periodAlpha2.duration_days === 6, 'Period calculates duration_days: 6');

    // List periods
    const listPeriodsRes = await app.inject({
      method: 'GET',
      url: '/api/periods?page=1&limit=10',
      headers: { authorization: `Bearer ${tokenAlpha}` },
    });
    assert(listPeriodsRes.statusCode === 200, 'GET /api/periods returns 200 with list');
    const periodList = JSON.parse(listPeriodsRes.payload).data;
    assert(periodList.periods.length >= 2, 'GET /api/periods lists all user periods');
    assert(periodList.pagination.total >= 2, 'GET /api/periods includes pagination metadata');

    // Get period by ID
    const getPeriodRes = await app.inject({
      method: 'GET',
      url: `/api/periods/${periodAlpha2.id}`,
      headers: { authorization: `Bearer ${tokenAlpha}` },
    });
    assert(getPeriodRes.statusCode === 200, 'GET /api/periods/:id returns 200');

    // Update period
    const updatePeriodRes = await app.inject({
      method: 'PUT',
      url: `/api/periods/${periodAlpha2.id}`,
      headers: { authorization: `Bearer ${tokenAlpha}` },
      payload: { end_date: '2026-10-07', notes: 'Updated notes' },
    });
    assert(updatePeriodRes.statusCode === 200, 'PUT /api/periods/:id updates period with 200');
    assert(JSON.parse(updatePeriodRes.payload).data.period.end_date === '2026-10-07', 'Updated end_date persisted');

    // Delete period (create a temporary one to delete)
    const tempPeriodRes = await app.inject({
      method: 'POST',
      url: '/api/periods',
      headers: { authorization: `Bearer ${tokenAlpha}` },
      payload: { start_date: '2026-08-01', end_date: '2026-08-05' },
    });
    const tempPeriodId = JSON.parse(tempPeriodRes.payload).data.period.id;
    const deletePeriodRes = await app.inject({
      method: 'DELETE',
      url: `/api/periods/${tempPeriodId}`,
      headers: { authorization: `Bearer ${tokenAlpha}` },
    });
    assert(deletePeriodRes.statusCode === 200, 'DELETE /api/periods/:id removes period with 200');

    // -------------------------------------------------------------
    // SECTION 5: Daily Period Flow APIs
    // -------------------------------------------------------------
    console.log('\n--- 5. Daily Period Flow APIs ---');

    // Flow validation error
    const badFlowRes = await app.inject({
      method: 'POST',
      url: `/api/periods/${periodAlpha2.id}/days`,
      headers: { authorization: `Bearer ${tokenAlpha}` },
      payload: { log_date: '2026-10-02', flow: 'extreme' },
    });
    assert(badFlowRes.statusCode === 400, 'POST /api/periods/:id/days rejects invalid flow value with 400');

    // Date outside period boundary error
    const outsideDateRes = await app.inject({
      method: 'POST',
      url: `/api/periods/${periodAlpha2.id}/days`,
      headers: { authorization: `Bearer ${tokenAlpha}` },
      payload: { log_date: '2026-10-15', flow: 'heavy' }, // period is 2026-10-01 to 2026-10-07
    });
    assert(outsideDateRes.statusCode === 400, 'POST /api/periods/:id/days rejects date outside period range with 400');

    // Valid day log creation
    const dayLogRes1 = await app.inject({
      method: 'POST',
      url: `/api/periods/${periodAlpha2.id}/days`,
      headers: { authorization: `Bearer ${tokenAlpha}` },
      payload: { log_date: '2026-10-01', flow: 'heavy' },
    });
    assert(dayLogRes1.statusCode === 201, 'POST /api/periods/:id/days creates flow log with 201');
    const dayLog1 = JSON.parse(dayLogRes1.payload).data.dayLog;

    // Duplicate day log on same period & date
    const dupDayLogRes = await app.inject({
      method: 'POST',
      url: `/api/periods/${periodAlpha2.id}/days`,
      headers: { authorization: `Bearer ${tokenAlpha}` },
      payload: { log_date: '2026-10-01', flow: 'medium' },
    });
    assert(dupDayLogRes.statusCode === 409, 'POST /api/periods/:id/days rejects duplicate (period, date) with 409');

    // List day logs
    const listDaysRes = await app.inject({
      method: 'GET',
      url: `/api/periods/${periodAlpha2.id}/days`,
      headers: { authorization: `Bearer ${tokenAlpha}` },
    });
    assert(listDaysRes.statusCode === 200, 'GET /api/periods/:id/days returns 200');
    assert(JSON.parse(listDaysRes.payload).data.days.length >= 1, 'GET /api/periods/:id/days returns day log list');

    // Update day log
    const updateDayRes = await app.inject({
      method: 'PUT',
      url: `/api/periods/${periodAlpha2.id}/days/${dayLog1.id}`,
      headers: { authorization: `Bearer ${tokenAlpha}` },
      payload: { flow: 'very_heavy' },
    });
    assert(updateDayRes.statusCode === 200, 'PUT /api/periods/:id/days/:dayLogId updates flow to very_heavy');

    // Delete day log
    const deleteDayRes = await app.inject({
      method: 'DELETE',
      url: `/api/periods/${periodAlpha2.id}/days/${dayLog1.id}`,
      headers: { authorization: `Bearer ${tokenAlpha}` },
    });
    assert(deleteDayRes.statusCode === 200, 'DELETE /api/periods/:id/days/:dayLogId returns 200');

    // -------------------------------------------------------------
    // SECTION 6: Symptom APIs
    // -------------------------------------------------------------
    console.log('\n--- 6. Symptom APIs ---');

    // Invalid symptom type
    const badSymptomRes = await app.inject({
      method: 'POST',
      url: '/api/symptoms',
      headers: { authorization: `Bearer ${tokenAlpha}` },
      payload: { log_date: '2026-10-02', symptom_type: 'unknown_symptom' },
    });
    assert(badSymptomRes.statusCode === 400, 'POST /api/symptoms rejects invalid symptom_type with 400');

    // Invalid severity
    const badSeverityRes = await app.inject({
      method: 'POST',
      url: '/api/symptoms',
      headers: { authorization: `Bearer ${tokenAlpha}` },
      payload: { log_date: '2026-10-02', symptom_type: 'cramps', severity: 9 },
    });
    assert(badSeverityRes.statusCode === 400, 'POST /api/symptoms rejects severity > 5 with 400');

    // Valid symptom
    const symptomRes1 = await app.inject({
      method: 'POST',
      url: '/api/symptoms',
      headers: { authorization: `Bearer ${tokenAlpha}` },
      payload: { log_date: '2026-10-02', symptom_type: 'cramps', severity: 4, notes: 'Severe morning cramps' },
    });
    assert(symptomRes1.statusCode === 201, 'POST /api/symptoms creates symptom entry with 201');
    const symptom1 = JSON.parse(symptomRes1.payload).data.symptom;

    // Duplicate symptom on same user, date, and symptom_type
    const dupSymptomRes = await app.inject({
      method: 'POST',
      url: '/api/symptoms',
      headers: { authorization: `Bearer ${tokenAlpha}` },
      payload: { log_date: '2026-10-02', symptom_type: 'cramps', severity: 2 },
    });
    assert(dupSymptomRes.statusCode === 409, 'POST /api/symptoms rejects duplicate (user, date, type) with 409');

    // Filter symptoms by date
    const listSymptomsRes = await app.inject({
      method: 'GET',
      url: '/api/symptoms?start_date=2026-10-01&end_date=2026-10-31',
      headers: { authorization: `Bearer ${tokenAlpha}` },
    });
    assert(listSymptomsRes.statusCode === 200, 'GET /api/symptoms with date filter returns 200');
    assert(JSON.parse(listSymptomsRes.payload).data.symptoms.length >= 1, 'GET /api/symptoms returns filtered logs');

    // Update symptom
    const updateSymptomRes = await app.inject({
      method: 'PUT',
      url: `/api/symptoms/${symptom1.id}`,
      headers: { authorization: `Bearer ${tokenAlpha}` },
      payload: { severity: 2, notes: 'Feeling better in afternoon' },
    });
    assert(updateSymptomRes.statusCode === 200, 'PUT /api/symptoms/:id updates symptom with 200');

    // Delete symptom
    const deleteSymptomRes = await app.inject({
      method: 'DELETE',
      url: `/api/symptoms/${symptom1.id}`,
      headers: { authorization: `Bearer ${tokenAlpha}` },
    });
    assert(deleteSymptomRes.statusCode === 200, 'DELETE /api/symptoms/:id deletes symptom with 200');

    // -------------------------------------------------------------
    // SECTION 7: Cross-User Isolation & Security
    // -------------------------------------------------------------
    console.log('\n--- 7. Cross-User Isolation & Security ---');

    // Create User Beta
    const betaSignup = await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: {
        name: 'Beta User',
        email: userBetaEmail,
        password: 'Password123!',
      },
    });
    const tokenBeta = JSON.parse(betaSignup.payload).data.token;

    // Beta creates a period
    const betaPeriodRes = await app.inject({
      method: 'POST',
      url: '/api/periods',
      headers: { authorization: `Bearer ${tokenBeta}` },
      payload: { start_date: '2026-09-15', end_date: '2026-09-20' },
    });
    const betaPeriodId = JSON.parse(betaPeriodRes.payload).data.period.id;

    // Alpha attempts to access Beta's period
    const crossGet = await app.inject({
      method: 'GET',
      url: `/api/periods/${betaPeriodId}`,
      headers: { authorization: `Bearer ${tokenAlpha}` },
    });
    assert(crossGet.statusCode === 404, 'Alpha cannot view Beta period (returns 404)');

    // Alpha attempts to modify Beta's period
    const crossPut = await app.inject({
      method: 'PUT',
      url: `/api/periods/${betaPeriodId}`,
      headers: { authorization: `Bearer ${tokenAlpha}` },
      payload: { notes: 'Malicious modification' },
    });
    assert(crossPut.statusCode === 404, 'Alpha cannot update Beta period (returns 404)');

    // Alpha attempts to delete Beta's period
    const crossDelete = await app.inject({
      method: 'DELETE',
      url: `/api/periods/${betaPeriodId}`,
      headers: { authorization: `Bearer ${tokenAlpha}` },
    });
    assert(crossDelete.statusCode === 404, 'Alpha cannot delete Beta period (returns 404)');

    // Alpha attempts to add flow log to Beta's period
    const crossDayLog = await app.inject({
      method: 'POST',
      url: `/api/periods/${betaPeriodId}/days`,
      headers: { authorization: `Bearer ${tokenAlpha}` },
      payload: { log_date: '2026-09-16', flow: 'light' },
    });
    assert(crossDayLog.statusCode === 404, 'Alpha cannot add flow day log to Beta period (returns 404)');

    // -------------------------------------------------------------
    // SECTION 8: Cycle & Calendar Read APIs
    // -------------------------------------------------------------
    console.log('\n--- 8. Cycle & Calendar Read APIs ---');

    // Cycle calculations for Alpha
    const cycleRes = await app.inject({
      method: 'GET',
      url: '/api/cycle',
      headers: { authorization: `Bearer ${tokenAlpha}` },
    });
    assert(cycleRes.statusCode === 200, 'GET /api/cycle returns 200');
    const cycleData = JSON.parse(cycleRes.payload).data;
    assert(cycleData.latest_period_start_date === '2026-10-01', 'GET /api/cycle returns latest period start date');
    assert(typeof cycleData.current_cycle_day === 'number', 'GET /api/cycle computes current_cycle_day');
    assert(Boolean(cycleData.estimated_next_period_start_date), 'GET /api/cycle computes estimated next start date');
    assert(cycleData.is_estimate === true, 'GET /api/cycle flags predictions as is_estimate: true');
    assert(typeof cycleData.disclaimer === 'string', 'GET /api/cycle includes medical disclaimer');

    // Calendar month query validation
    const badCalendarRes = await app.inject({
      method: 'GET',
      url: '/api/calendar?month=invalid-date',
      headers: { authorization: `Bearer ${tokenAlpha}` },
    });
    assert(badCalendarRes.statusCode === 400, 'GET /api/calendar rejects invalid month format with 400');

    // Calendar for 2026-10
    const calendarRes = await app.inject({
      method: 'GET',
      url: '/api/calendar?month=2026-10',
      headers: { authorization: `Bearer ${tokenAlpha}` },
    });
    assert(calendarRes.statusCode === 200, 'GET /api/calendar?month=2026-10 returns 200');
    const calData = JSON.parse(calendarRes.payload).data;
    assert(calData.date_range.start === '2026-10-01' && calData.date_range.end === '2026-10-31', 'Calendar computes correct month date range');
    assert(Array.isArray(calData.periods), 'Calendar returns periods array');
    assert(Array.isArray(calData.daily_flows), 'Calendar returns daily_flows array');
    assert(Array.isArray(calData.symptoms), 'Calendar returns symptoms array');
    assert(Array.isArray(calData.estimated_periods), 'Calendar returns estimated_periods array');
    assert(typeof calData.disclaimer === 'string', 'Calendar includes medical disclaimer');

    // -------------------------------------------------------------
    // SECTION 9: Existing Sample Data Verification
    // -------------------------------------------------------------
    console.log('\n--- 9. Data Preservation Verification ---');
    const sampleUser = await query('SELECT * FROM users WHERE id = 1');
    assert(sampleUser.rows.length === 1 && sampleUser.rows[0].email === 'testuser@example.com', 'Existing User #1 is fully preserved');

    const sampleProfile = await query('SELECT * FROM user_profiles WHERE user_id = 1');
    assert(sampleProfile.rows.length === 1 && sampleProfile.rows[0].birth_year === 2003, 'Existing User #1 profile is preserved');

    const samplePeriods = await query('SELECT * FROM periods WHERE user_id = 1');
    assert(samplePeriods.rows.length >= 1, 'Existing User #1 sample periods are preserved');

    const sampleDayLogs = await query('SELECT * FROM period_day_logs WHERE period_id = 1');
    assert(sampleDayLogs.rows.length >= 1, 'Existing User #1 period day logs are preserved');

    const sampleSymptoms = await query('SELECT * FROM symptom_logs WHERE user_id = 1');
    assert(sampleSymptoms.rows.length >= 1, 'Existing User #1 symptoms are preserved');

  } catch (err) {
    console.error('Test execution error:', err);
    failedTests++;
  } finally {
    // Clean up temporary test accounts created during test
    await query('DELETE FROM users WHERE email IN ($1, $2, $3)', [userAlphaEmail, userBetaEmail, userGammaEmail]).catch(() => {});
    await app.close();
    await closePool();

    console.log('\n====================================================');
    console.log(` Test Summary: ${passedTests} passed, ${failedTests} failed`);
    console.log('====================================================');
    process.exit(failedTests > 0 ? 1 : 0);
  }
}

runTests();
