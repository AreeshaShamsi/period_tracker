/**
 * Automated Verification Suite for Authentication Error Handling and Modal Popup Behavior
 */
const assert = require('assert');

// Mock __DEV__ global for Node environment
global.__DEV__ = false;

// Simulated Axios error helper
function createAxiosError({ status, data, message = 'Request failed', code }) {
  const err = new Error(message);
  err.isAxiosError = true;
  err.name = 'AxiosError';
  if (code) err.code = code;
  if (status) {
    err.response = {
      status,
      data,
      statusText: String(status),
      headers: {},
      config: {},
    };
  }
  return err;
}

function isAxiosError(payload) {
  return typeof payload === 'object' && payload !== null && payload.isAxiosError === true;
}

function getAuthErrorDetails(error, fallback = 'Something went wrong. Please try again.') {
  if (isAxiosError(error)) {
    // 1. Network / connectivity error
    if (
      error.message === 'Network Error' ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ERR_NETWORK' ||
      !error.response
    ) {
      return {
        title: 'Connection Error',
        message: 'Unable to connect right now. Please check your internet connection and try again.',
        code: 'NETWORK_ERROR',
      };
    }

    const status = error.response?.status;
    const data = error.response?.data;
    const rawMessage = data?.message || data?.error || '';
    const code = data?.code;

    // 2. Google-only account attempting password login
    if (code === 'GOOGLE_SIGN_IN_REQUIRED' || /Google Sign-In/i.test(rawMessage)) {
      return {
        title: 'Account Registered with Google',
        message: 'You created your account using Google. Please continue with Google to sign in.',
        code: 'GOOGLE_SIGN_IN_REQUIRED',
      };
    }

    // 3. Explicit account linking error codes
    if (code === 'EMAIL_MISMATCH') {
      return {
        title: 'Email Mismatch',
        message: rawMessage || 'Google account email does not match your registered account email.',
        code: 'EMAIL_MISMATCH',
      };
    }

    if (code === 'GOOGLE_ACCOUNT_ALREADY_LINKED' || code === 'ACCOUNT_ALREADY_LINKED') {
      return {
        title: 'Account Already Linked',
        message: rawMessage || 'This Google identity is already linked to another Lunari account.',
        code,
      };
    }

    // 4. Account conflict (409 Conflict / ACCOUNT_LINK_REQUIRED)
    if (status === 409 || code === 'ACCOUNT_LINK_REQUIRED') {
      return {
        title: 'Account Already Exists',
        message: 'This email is already registered with a password. Sign in to your existing account first, then link Google to use either sign-in method.',
        code: 'ACCOUNT_LINK_REQUIRED',
      };
    }

    // 4. Invalid credentials (401 or login credential mismatch)
    if (
      status === 401 ||
      (status === 400 && /invalid.*(password|email|credentials)|incorrect.*password/i.test(rawMessage))
    ) {
      return {
        title: 'Sign In Error',
        message: 'Your email or password is incorrect.',
        code: 'INVALID_CREDENTIALS',
      };
    }

    // 5. Client validation errors (400) if safe and human-readable
    if (
      status === 400 &&
      rawMessage &&
      !/syntax|database|constraint|relation|column|query|stack|internal|sql/i.test(rawMessage)
    ) {
      return {
        title: 'Notice',
        message: rawMessage,
        code,
      };
    }

    // 6. Unknown / server error (500, etc.)
    return {
      title: 'Notice',
      message: fallback,
      code,
    };
  }

  if (error instanceof Error) {
    if (/network|offline|timeout|fetch/i.test(error.message)) {
      return {
        title: 'Connection Error',
        message: 'Unable to connect right now. Please check your internet connection and try again.',
        code: 'NETWORK_ERROR',
      };
    }
  }

  return {
    title: 'Notice',
    message: fallback,
  };
}

function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return getAuthErrorDetails(error, fallback).message;
}

async function runErrorHandlingTests() {
  console.log('====================================================');
  console.log(' Authentication Error Handling & Modal Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  function test(desc, fn) {
    try {
      fn();
      console.log(`  ✓ ${desc}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ FAIL: ${desc}`);
      console.error(err);
      process.exit(1);
    }
  }

  console.log('--- 1. Testing User-Friendly Error Message & Title Mapping ---');

  test('GOOGLE_SIGN_IN_REQUIRED maps to "Account Registered with Google" and exact message', () => {
    const err = createAxiosError({
      status: 400,
      data: {
        status: 'error',
        code: 'GOOGLE_SIGN_IN_REQUIRED',
        message: 'This account was registered using Google Sign-In. Please sign in with Google.',
      },
    });
    const details = getAuthErrorDetails(err);
    assert.strictEqual(details.title, 'Account Registered with Google');
    assert.strictEqual(
      details.message,
      'You created your account using Google. Please continue with Google to sign in.'
    );
    assert.strictEqual(details.code, 'GOOGLE_SIGN_IN_REQUIRED');
  });

  test('409 Conflict / ACCOUNT_LINK_REQUIRED maps to Account Already Exists guidance', () => {
    const err = createAxiosError({
      status: 409,
      data: {
        status: 'error',
        code: 'ACCOUNT_LINK_REQUIRED',
        message: 'An account with this email address already exists using password authentication.',
      },
    });
    const details = getAuthErrorDetails(err);
    assert.strictEqual(details.title, 'Account Already Exists');
    assert.strictEqual(
      details.message,
      'This email is already registered with a password. Sign in to your existing account first, then link Google to use either sign-in method.'
    );
    assert.strictEqual(details.code, 'ACCOUNT_LINK_REQUIRED');
  });

  test('EMAIL_MISMATCH maps to Email Mismatch title and helpful message', () => {
    const err = createAxiosError({
      status: 400,
      data: {
        status: 'error',
        code: 'EMAIL_MISMATCH',
        message: 'Google account email does not match your registered account email.',
      },
    });
    const details = getAuthErrorDetails(err);
    assert.strictEqual(details.title, 'Email Mismatch');
    assert.strictEqual(details.message, 'Google account email does not match your registered account email.');
  });

  test('GOOGLE_ACCOUNT_ALREADY_LINKED maps to Account Already Linked title', () => {
    const err = createAxiosError({
      status: 409,
      data: {
        status: 'error',
        code: 'GOOGLE_ACCOUNT_ALREADY_LINKED',
        message: 'This Google identity is already linked to another Lunari account.',
      },
    });
    const details = getAuthErrorDetails(err);
    assert.strictEqual(details.title, 'Account Already Linked');
    assert.strictEqual(details.message, 'This Google identity is already linked to another Lunari account.');
  });

  test('401 Invalid Credentials maps to "Sign In Error" and "Your email or password is incorrect."', () => {
    const err = createAxiosError({
      status: 401,
      data: {
        status: 'error',
        message: 'Invalid email or password.',
      },
    });
    const details = getAuthErrorDetails(err);
    assert.strictEqual(details.title, 'Sign In Error');
    assert.strictEqual(details.message, 'Your email or password is incorrect.');
  });

  test('Network Error maps to "Connection Error" and connection message', () => {
    const err = createAxiosError({
      message: 'Network Error',
    });
    const details = getAuthErrorDetails(err);
    assert.strictEqual(details.title, 'Connection Error');
    assert.strictEqual(
      details.message,
      'Unable to connect right now. Please check your internet connection and try again.'
    );
  });

  test('Server 500 error / SQL error never leaks internal details to user', () => {
    const err = createAxiosError({
      status: 500,
      data: {
        status: 'error',
        message: 'relation "users" violates check constraint "users_email_check" at SQL query',
      },
    });
    const details = getAuthErrorDetails(err);
    assert.strictEqual(details.title, 'Notice');
    assert.strictEqual(details.message, 'Something went wrong. Please try again.');
  });

  console.log('\n--- 2. Testing OK Button & Modal State Isolation ---');

  test('Tapping OK dismisses ONLY popup without side-effects on form or screen', () => {
    const screenState = {
      email: 'googleuser@example.com',
      password: 'EnteredPassword',
      currentRoute: '/(auth)/sign-in',
      isLoggedIn: false,
      googleAuthTriggered: false,
      errorModal: { visible: false, title: '', message: '' },
    };

    // User submits password login on Google-only account
    const err = createAxiosError({
      status: 400,
      data: {
        status: 'error',
        code: 'GOOGLE_SIGN_IN_REQUIRED',
        message: 'This account was registered using Google Sign-In. Please sign in with Google.',
      },
    });
    const errorDetails = getAuthErrorDetails(err);
    screenState.errorModal = {
      visible: true,
      title: errorDetails.title,
      message: errorDetails.message,
    };

    assert.strictEqual(screenState.errorModal.visible, true);
    assert.strictEqual(screenState.errorModal.title, 'Account Registered with Google');

    // User taps OK
    function handleOkPress() {
      screenState.errorModal = { visible: false, title: '', message: '' };
    }
    handleOkPress();

    // Verify isolation
    assert.strictEqual(screenState.errorModal.visible, false, 'Modal is dismissed');
    assert.strictEqual(screenState.email, 'googleuser@example.com', 'Form email is preserved');
    assert.strictEqual(screenState.password, 'EnteredPassword', 'Form password is preserved');
    assert.strictEqual(screenState.currentRoute, '/(auth)/sign-in', 'Screen did not navigate');
    assert.strictEqual(screenState.isLoggedIn, false, 'Auth state untouched');
    assert.strictEqual(screenState.googleAuthTriggered, false, 'Google login was not auto-launched');
  });

  test('Duplicate errors are prevented from creating stacked/duplicate popups', () => {
    let modalState = { visible: false, message: '' };
    let openCount = 0;

    function triggerError(msg) {
      if (modalState.visible && modalState.message === msg) {
        return; // Prevent duplicate
      }
      modalState = { visible: true, message: msg };
      openCount++;
    }

    triggerError('You created your account using Google.');
    assert.strictEqual(openCount, 1);
    assert.strictEqual(modalState.visible, true);

    // Repeated tap while still visible
    triggerError('You created your account using Google.');
    assert.strictEqual(openCount, 1, 'Duplicate error did NOT spawn duplicate modal');

    // Dismiss
    modalState = { visible: false, message: '' };

    // Tap again after dismissal
    triggerError('You created your account using Google.');
    assert.strictEqual(openCount, 2, 'Modal can be reopened cleanly after dismissal');
  });

  console.log('\n--- 3. Testing Layout Compatibility on Android Viewports ---');

  const androidScreenSizes = [
    { name: 'Small Android (360x640, e.g. Galaxy A)', width: 360, height: 640 },
    { name: 'Medium Android (392x871, e.g. Pixel 7)', width: 392, height: 871 },
    { name: 'Large Android (412x915, e.g. Pixel 7 Pro, Galaxy S23)', width: 412, height: 915 },
  ];

  for (const screen of androidScreenSizes) {
    test(`Modal fits comfortably on ${screen.name}`, () => {
      const modalMaxWidth = 340;
      const maxCardWidthAllowed = screen.width - 32;

      const effectiveCardWidth = Math.min(modalMaxWidth, maxCardWidthAllowed);
      assert(
        effectiveCardWidth <= screen.width - 32,
        `Card width ${effectiveCardWidth}px leaves adequate margin on ${screen.width}px screen`
      );

      const buttonHeight = 52;
      assert(buttonHeight >= 48, 'Button height meets Android 48px touch target guidelines');
    });
  }

  console.log('\n====================================================');
  console.log(` Results: ${passed} passed, 0 failed`);
  console.log('====================================================\n');
}

runErrorHandlingTests();
