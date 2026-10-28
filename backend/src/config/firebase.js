const path = require('path');
const fs = require('fs');
const { initializeApp, getApps, getApp, cert, applicationDefault } = require('firebase-admin/app');
const { getAuth: getFirebaseAuth } = require('firebase-admin/auth');

let mockAuth = null;

/**
 * For testing purposes: inject a mock Firebase Auth instance
 * @param {object|null} customAuth
 */
function _setAuthInstance(customAuth) {
  mockAuth = customAuth;
}

/**
 * Determine if server environment has credentials configured for Firebase Admin
 * @returns {boolean}
 */
function isFirebaseConfigured() {
  if (mockAuth) return true;
  if (getApps().length > 0) return true;

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    return true;
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH && fs.existsSync(path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH))) {
    return true;
  }

  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return true;
  }

  if (process.env.FIREBASE_PROJECT_ID) {
    return true;
  }

  return false;
}

/**
 * Initialize Firebase Admin SDK if not already initialized
 */
function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApp();
  }

  // 1. Explicit service account JSON file path
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const resolvedPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    if (fs.existsSync(resolvedPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
      return initializeApp({
        credential: cert(serviceAccount),
      });
    }
  }

  // 2. Explicit environment variables (Render / CI / Docker friendly)
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    return initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
  }

  // 3. Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS / Cloud Run / GCP)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return initializeApp({
      credential: applicationDefault(),
    });
  }

  // 4. Project ID (allows verifying Firebase ID tokens via Google's public certificates)
  if (process.env.FIREBASE_PROJECT_ID) {
    return initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }

  return null;
}

/**
 * Retrieve Firebase Auth service instance.
 * Throws 500 error if Firebase Admin is unconfigured and no mock is set.
 * @returns {import('firebase-admin/auth').Auth}
 */
function getAuth() {
  if (mockAuth) {
    return mockAuth;
  }

  if (getApps().length === 0) {
    const initializedApp = initializeFirebaseAdmin();
    if (!initializedApp) {
      const err = new Error(
        'Firebase Admin SDK is not configured on the server. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY, or GOOGLE_APPLICATION_CREDENTIALS.'
      );
      err.statusCode = 500;
      throw err;
    }
    return getFirebaseAuth(initializedApp);
  }

  return getFirebaseAuth();
}

module.exports = {
  getAuth,
  _setAuthInstance,
  isFirebaseConfigured,
  initializeFirebaseAdmin,
};
