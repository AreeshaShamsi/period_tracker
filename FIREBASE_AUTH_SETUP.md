# Lunari - Firebase Authentication Integration & Setup Guide

This guide details the complete configuration, environment variables, security safeguards, and build instructions for Firebase Authentication with Google Sign-In in Lunari.

---

## 1. Architecture Overview

```
┌─────────────────────────────────┐
│     Expo React Native Client    │
│  com.balaji_ro.periodtracker    │
└────────────────┬────────────────┘
                 │ 1. Native Google Sign-In (@react-native-google-signin/google-signin)
                 ▼
┌─────────────────────────────────┐
│     Firebase Client Auth SDK    │
│  (signInWithCredential / Popup) │
└────────────────┬────────────────┘
                 │ 2. Issues Firebase ID Token (JWT)
                 ▼
┌─────────────────────────────────┐
│     Lunari Fastify Backend      │
│  (POST /api/auth/google)        │
│  (POST /api/auth/link-google)   │
└────────────────┬────────────────┘
                 │ 3. Server-side verification via firebase-admin SDK
                 │ 4. Anti-account-takeover enforcement & PostgreSQL user lookup
                 │ 5. Issues Lunari application session JWT
                 ▼
┌─────────────────────────────────┐
│     PostgreSQL Database         │
│  users (firebase_uid, google_id)│
└─────────────────────────────────┘
```

---

## 2. Firebase Console Manual Setup Steps

To enable real-device Google Sign-In, follow these steps in the [Firebase Console](https://console.firebase.google.com/):

### Step 1: Create or Open Your Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project (e.g. `lunari-period-tracker`) or open your existing project.

### Step 2: Register Android App
1. In Project Overview, click **Add app** and select **Android**.
2. **Android package name**: Enter exactly:
   ```
   com.balaji_ro.periodtracker
   ```
3. **App nickname** (optional): `Lunari Period Tracker`.
4. **Debug signing certificate SHA-1**:
   - Run the following command in your terminal to extract your local debug keystore SHA-1 and SHA-256:
     ```bash
     # Windows (PowerShell):
     keytool -list -v -keystore "$env:USERPROFILE\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android

     # macOS / Linux:
     keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
     ```
   - Copy the `SHA1` fingerprint and paste it into the Firebase console.
   - Also add the `SHA-256` fingerprint (click **Add fingerprint** in project settings).
5. Click **Register app**.
6. Download `google-services.json` and place it in `frontend/google-services.json` (and `android/app/google-services.json` if building bare native).
7. If using `googleServicesFile` in `frontend/app.json`, add:
   ```json
   "android": {
     "package": "com.balaji_ro.periodtracker",
     "googleServicesFile": "./google-services.json"
   }
   ```

### Step 3: Enable Sign-In Providers in Firebase Console

1. In the [Firebase Console](https://console.firebase.google.com/), navigate to **Build** -> **Authentication** -> **Sign-in method**.

#### A. Enable Email/Password Provider
1. Click **Add new provider** and select **Email/Password**.
2. Toggle **Enable** (Email/Password).
3. (Optional) Toggle **Email link (passwordless sign-in)** if desired, or leave disabled for standard password authentication.
4. Click **Save**.

#### B. Enable Google Sign-In Provider
1. Click **Add new provider** and select **Google**.
2. Toggle **Enable**.
3. Set the **Project support email**.
4. Under **Web SDK configuration**, note the automatically generated **Web client ID** and **Web client secret** (you will use this as `EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID`).
5. Click **Save**.

### Step 4: Register Web App (For Public Frontend Config)
1. Go to **Project Settings** -> **General** -> **Your apps** -> **Add app** -> **Web** (`</>`).
2. App nickname: `Lunari Web`.
3. Click **Register app**.
4. Copy the `firebaseConfig` object values (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`).

### Step 5: Generate Backend Firebase Admin Service Account Key
1. In Firebase Console, go to **Project Settings** -> **Service accounts**.
2. Select **Firebase Admin SDK** (Node.js).
3. Click **Generate new private key**.
4. Save the downloaded JSON securely. **NEVER commit this file to Git.**
5. You can configure the backend using either:
   - **Option A (Environment Variables)**: Set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` in `backend/.env`.
   - **Option B (Service Account File)**: Save the JSON file in `backend/service-account.json` (already in `.gitignore`) and set `FIREBASE_SERVICE_ACCOUNT_PATH=./service-account.json`.

---

## 3. Environment Variables Configuration

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/period_tracker
PORT=5000
HOST=0.0.0.0
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_minimum_32_characters_long
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:8081,http://127.0.0.1:8081,http://localhost:19006,http://127.0.0.1:19006,http://localhost:5000,http://127.0.0.1:5000

# Option A: Environment Variables for Firebase Admin SDK
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-firebase-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

# Option B: Path to Service Account JSON
# FIREBASE_SERVICE_ACCOUNT_PATH=./service-account.json

# Option C: Google Application Default Credentials
# GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

### Frontend (`frontend/.env`)

```env
# Fastify backend base URL
# Android Emulator: http://10.0.2.2:5000
# Physical Android device: http://<YOUR_LOCAL_IP>:5000 (e.g., http://192.168.1.100:5000)
# Web browser: http://localhost:5000
EXPO_PUBLIC_API_URL=http://localhost:5000

# Firebase Client Configuration (Safe public credentials)
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-firebase-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-firebase-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxxxxxxxxxxx

# Firebase Web Client ID for native Google Sign-In configuration
EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
```

---

## 4. Running the Development Build

> [!IMPORTANT]
> Native Google Sign-In (`@react-native-google-signin/google-signin`) uses native Android libraries (`com.google.android.gms:play-services-auth`) that are not compiled into the standard generic Expo Go client. You must use an Expo development build or standalone build.

### Running Local Android Development Build:

1. Ensure Android Studio, Android SDK (API 34/35), and an Android Virtual Device (AVD) with Google Play Services or a physical device with USB debugging are ready.
2. Generate native Android project and start development build:
   ```bash
   cd frontend
   npx expo run:android
   ```
3. Once built and installed on the device/emulator, start the Metro bundler:
   ```bash
   npx expo start --dev-client
   ```

---

## 5. Building Android APK / AAB (EAS Build)

### Prerequisites:
Install EAS CLI and login:
```bash
npm install -g eas-cli
eas login
```

### 1. Build Android Development APK (for testing):
```bash
cd frontend
eas build --profile development --platform android
```
- This builds an `.apk` with `expo-dev-client` included.
- Install the `.apk` on your test device via `adb install <path-to-apk>.apk`.

### 2. Build Android Preview APK (standalone release APK without store upload):
Add to `frontend/eas.json` under `build`:
```json
"preview": {
  "distribution": "internal",
  "android": {
    "buildType": "apk"
  }
}
```
Run:
```bash
cd frontend
eas build --profile preview --platform android
```

### 3. Build Android Production App Bundle (AAB for Google Play Store):
```bash
cd frontend
eas build --profile production --platform android
```
> [!IMPORTANT]
> When uploading to Google Play Console:
> Google Play App Signing will sign your release build with a Google-managed key. You must copy the **App signing key certificate SHA-1 and SHA-256** from **Google Play Console** -> **Setup** -> **App signing** and add them to your Firebase Console under **Android App Signing fingerprints**.

---

## 6. Testing the Integration

### 1. Backend Automated Tests:
Run all backend database, API, CORS, and Firebase authentication tests:
```bash
cd backend
npm test
```
Tests cover:
- Valid Firebase ID token verification (mock admin)
- Expired tokens rejection (401)
- Invalid signature / malformed token rejection (401)
- Missing/blank tokens rejection (401)
- Unverified email rejection (401)
- Missing UID/email rejection (401)
- Unconfigured server safety (500 without credentials)
- Account conflict / Anti-account-takeover protection (409 `ACCOUNT_LINK_REQUIRED`)
- New user creation and idempotent login
- Explicit authenticated account linking (`POST /api/auth/link-google`)
- Account linking validation (`EMAIL_MISMATCH`, `GOOGLE_ACCOUNT_ALREADY_LINKED`)
- Lunari JWT session issuance and verification
- Token revocation and logout

### 2. Frontend Automated Tests:
```bash
# Onboarding & RootGuard regression suite (42 tests):
node frontend/test-onboarding-navigation-regression.js

# Authentication error handling & modal suite (12 tests):
node frontend/test-error-handling.js

# TypeScript validation:
cd frontend && npx tsc --noEmit

# Expo lint:
cd frontend && npm run lint
```
