import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import * as FirebaseAuthModule from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import Constants from "expo-constants";

const {
  initializeAuth,
  getAuth,
} = FirebaseAuthModule;

// getReactNativePersistence is provided by Firebase Auth in React Native environments
const getReactNativePersistence = (FirebaseAuthModule as any).getReactNativePersistence;

/**
 * Safely sanitize environment / configuration values (strips whitespace and enclosing quotes)
 */
function sanitizeConfigValue(...candidates: unknown[]): string {
  for (const c of candidates) {
    if (typeof c === "string") {
      const trimmed = c.trim().replace(/^["']|["']$/g, "").trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }
  return "";
}

const extra = ((Constants?.expoConfig?.extra || (Constants as any)?.manifest?.extra) || {}) as Record<string, any>;
const extraFirebase = (extra.firebase || {}) as Record<string, any>;

/**
 * Public client Firebase configuration.
 * Loaded from EXPO_PUBLIC_* environment variables or app.json extra.
 * Safe for inclusion in frontend client builds.
 */
export const firebaseConfig = {
  apiKey: sanitizeConfigValue(
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    process.env.FIREBASE_API_KEY,
    extra.firebaseApiKey,
    extraFirebase.apiKey
  ),
  authDomain: sanitizeConfigValue(
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    process.env.FIREBASE_AUTH_DOMAIN,
    extra.firebaseAuthDomain,
    extraFirebase.authDomain
  ),
  projectId: sanitizeConfigValue(
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    process.env.FIREBASE_PROJECT_ID,
    extra.firebaseProjectId,
    extraFirebase.projectId
  ),
  storageBucket: sanitizeConfigValue(
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    process.env.FIREBASE_STORAGE_BUCKET,
    extra.firebaseStorageBucket,
    extraFirebase.storageBucket
  ),
  messagingSenderId: sanitizeConfigValue(
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    process.env.FIREBASE_MESSAGING_SENDER_ID,
    extra.firebaseMessagingSenderId,
    extraFirebase.messagingSenderId
  ),
  appId: sanitizeConfigValue(
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    process.env.FIREBASE_APP_ID,
    extra.firebaseAppId,
    extraFirebase.appId
  ),
};

/**
 * Web Client ID configured in Google Cloud / Firebase Authentication.
 * Passed to @react-native-google-signin/google-signin configure({ webClientId }).
 */
export const webClientId: string = sanitizeConfigValue(
  process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID,
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
  process.env.FIREBASE_WEB_CLIENT_ID,
  extra.firebaseWebClientId,
  extraFirebase.webClientId
);

/**
 * Verify whether client Firebase credentials are provided in environment.
 * Requires a non-empty apiKey and projectId.
 */
export function isFirebaseClientConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey.length > 5 &&
    firebaseConfig.projectId
  );
}

// Track cached app and auth instances to avoid duplicate initialization
let _cachedApp: FirebaseApp | null = null;
let _cachedAuth: FirebaseAuthModule.Auth | null = null;

/**
 * Retrieve or initialize Firebase App instance safely.
 * Returns existing app if already initialized.
 */
export function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  if (_cachedApp) {
    return _cachedApp;
  }
  if (!isFirebaseClientConfigured()) {
    throw new Error(
      "Firebase is not configured. Please define EXPO_PUBLIC_FIREBASE_API_KEY and EXPO_PUBLIC_FIREBASE_PROJECT_ID in your frontend .env file."
    );
  }
  _cachedApp = initializeApp(firebaseConfig);
  return _cachedApp;
}

/**
 * Retrieve or initialize Firebase Auth instance safely.
 * Configures AsyncStorage persistence on native and standard web auth on web.
 */
export function getFirebaseAuth(): FirebaseAuthModule.Auth {
  if (_cachedAuth) {
    return _cachedAuth;
  }

  const app = getFirebaseApp();

  // Check if auth is already associated with this app instance
  try {
    const existing = getAuth(app);
    if (existing) {
      _cachedAuth = existing;
      return _cachedAuth;
    }
  } catch {}

  if (Platform.OS === "web" || typeof getReactNativePersistence !== "function") {
    _cachedAuth = getAuth(app);
  } else {
    try {
      _cachedAuth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch {
      // If already initialized (e.g. fast refresh or test environments)
      _cachedAuth = getAuth(app);
    }
  }

  return _cachedAuth;
}

// If already configured at startup, initialize instances immediately
if (isFirebaseClientConfigured()) {
  try {
    getFirebaseAuth();
  } catch {}
}

// Exported proxy objects ensure backwards compatibility for direct imports
export const firebaseApp: FirebaseApp = new Proxy({} as FirebaseApp, {
  get(_target, prop, receiver) {
    const app = getFirebaseApp();
    const value = Reflect.get(app as any, prop, receiver);
    return typeof value === "function" ? value.bind(app) : value;
  },
});

export const firebaseAuth: FirebaseAuthModule.Auth = new Proxy(
  {} as FirebaseAuthModule.Auth,
  {
    get(_target, prop, receiver) {
      const auth = getFirebaseAuth();
      const value = Reflect.get(auth as any, prop, receiver);
      return typeof value === "function" ? value.bind(auth) : value;
    },
  }
);
