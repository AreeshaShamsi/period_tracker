/**
 * Automated Verification Suite for Lunari Backend CORS Configuration
 */
const buildApp = require('./src/app');

async function runCorsTests() {
  console.log('====================================================');
  console.log(' Lunari CORS Configuration Verification Suite');
  console.log('====================================================\n');

  const app = buildApp({ logger: false });
  await app.ready();

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  const allowedDevelopmentOrigins = [
    'http://localhost:8081',
    'http://127.0.0.1:8081',
    'http://localhost:19006',
    'http://127.0.0.1:19006',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
  ];

  console.log('--- 1. Testing Preflight OPTIONS on Development Origins ---');
  for (const origin of allowedDevelopmentOrigins) {
    const res = await app.inject({
      method: 'OPTIONS',
      url: '/api/auth/signup',
      headers: {
        origin,
        'access-control-request-method': 'POST',
        'access-control-request-headers': 'content-type,authorization',
      },
    });

    assert(res.statusCode === 204, `${origin} preflight returns 204 No Content`);
    assert(
      res.headers['access-control-allow-origin'] === origin,
      `${origin} returns Access-Control-Allow-Origin: ${origin}`
    );
    assert(
      res.headers['access-control-allow-methods'].includes('PATCH'),
      `${origin} includes PATCH in Access-Control-Allow-Methods`
    );
    assert(
      res.headers['access-control-allow-methods'].includes('OPTIONS'),
      `${origin} includes OPTIONS in Access-Control-Allow-Methods`
    );
    assert(
      res.headers['access-control-allow-headers'].toLowerCase().includes('authorization'),
      `${origin} includes Authorization in Access-Control-Allow-Headers`
    );
    assert(
      res.headers['access-control-allow-credentials'] === undefined,
      `${origin} does not set credentials for Bearer token auth`
    );
  }

  console.log('\n--- 2. Testing Preflight on Protected Routes ---');
  const mePreflight = await app.inject({
    method: 'OPTIONS',
    url: '/api/auth/me',
    headers: {
      origin: 'http://localhost:8081',
      'access-control-request-method': 'GET',
      'access-control-request-headers': 'authorization',
    },
  });
  assert(mePreflight.statusCode === 204, 'GET /api/auth/me preflight returns 204');
  assert(
    mePreflight.headers['access-control-allow-origin'] === 'http://localhost:8081',
    'GET /api/auth/me preflight allows http://localhost:8081'
  );

  console.log('\n--- 3. Testing Unauthorized Origin Rejection ---');
  const badRes = await app.inject({
    method: 'OPTIONS',
    url: '/api/auth/signup',
    headers: {
      origin: 'http://unauthorized-evil-domain.com',
      'access-control-request-method': 'POST',
    },
  });
  assert(
    badRes.headers['access-control-allow-origin'] === undefined,
    'Unauthorized origin does not receive Access-Control-Allow-Origin header'
  );

  console.log('\n--- 4. Testing Actual Requests with Origin Header ---');
  // Actual request with Origin (simulating browser fetch/axios from Expo Web)
  const loginRes = await app.inject({
    method: 'POST',
    url: '/api/auth/login',
    headers: {
      origin: 'http://localhost:8081',
      'content-type': 'application/json',
    },
    payload: {
      email: 'nonexistent@example.com',
      password: 'SomePassword123',
    },
  });

  assert(
    loginRes.headers['access-control-allow-origin'] === 'http://localhost:8081',
    'POST /api/auth/login includes Access-Control-Allow-Origin for http://localhost:8081'
  );
  assert(
    loginRes.headers['vary'] === 'Origin',
    'Response includes Vary: Origin'
  );

  console.log('\n====================================================');
  console.log(` Results: ${passed} passed, ${failed} failed`);
  console.log('====================================================\n');

  await app.close();

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runCorsTests();
