import { Platform } from "react-native";
import { isAxiosError } from "axios";
import { api } from "./api";
import {
  clearAuthToken,
  clearAuthUser,
  saveAuthToken,
  saveAuthUser,
} from "@/lib/storage";
import {
  AuthResponse,
  CurrentUserResponse,
  LoginRequest,
  LogoutResponse,
  SignupRequest,
} from "@/types/auth";

export interface AuthErrorInfo {
  title: string;
  message: string;
  code?: string;
}

/**
 * Extracts structured, user-friendly error details (title, message, code)
 * from an API error response.
 *
 * Rules:
 * - Google-only account (code: GOOGLE_SIGN_IN_REQUIRED):
 *     Title: "Account Registered with Google"
 *     Message: "You created your account using Google. Please continue with Google to sign in."
 * - Account conflict (409 / ACCOUNT_LINK_REQUIRED):
 *     Title: "Account Exists"
 *     Message: "An account with this email address already exists. Please sign in using your password instead of Google."
 * - Invalid credentials (401 / 400 credentials):
 *     Title: "Sign In Error"
 *     Message: "Your email or password is incorrect."
 * - Network / server unavailable:
 *     Title: "Connection Error"
 *     Message: "Unable to connect right now. Please check your internet connection and try again."
 * - Unknown errors / 500:
 *     Title: "Notice"
 *     Message: "Something went wrong. Please try again."
 */
export function getAuthErrorDetails(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): AuthErrorInfo {
  if (__DEV__) {
    console.warn("[auth.service] Caught authentication error:", error);
  }

  // 1. Firebase Authentication error codes (from Firebase Auth client SDK)
  const errCode = (error as any)?.code;
  const errMessage = (error as any)?.message || "";

  if (errCode === "auth/email-already-in-use" || /email-already-in-use/i.test(errMessage)) {
    return {
      title: "Account Already Exists",
      message: "An account with this email address already exists. Please sign in instead.",
      code: "ACCOUNT_EXISTS",
    };
  }

  if (errCode === "auth/user-not-found" || /user-not-found/i.test(errMessage)) {
    return {
      title: "Account Not Found",
      message: "No account found with this email address. Please sign up first.",
      code: "USER_NOT_FOUND",
    };
  }

  if (
    errCode === "auth/wrong-password" ||
    errCode === "auth/invalid-credential" ||
    /invalid-credential|wrong-password/i.test(errMessage)
  ) {
    return {
      title: "Sign In Error",
      message: "Your email or password is incorrect.",
      code: "INVALID_CREDENTIALS",
    };
  }

  if (errCode === "auth/weak-password" || /weak-password/i.test(errMessage)) {
    return {
      title: "Weak Password",
      message: "Password is too weak. Please use at least 6 characters.",
      code: "WEAK_PASSWORD",
    };
  }

  if (errCode === "auth/invalid-email" || /invalid-email/i.test(errMessage)) {
    return {
      title: "Invalid Email",
      message: "Please enter a valid email address.",
      code: "INVALID_EMAIL",
    };
  }

  if (errCode === "auth/too-many-requests" || /too-many-requests/i.test(errMessage)) {
    return {
      title: "Access Temporarily Disabled",
      message: "Too many failed attempts. Please try again later or reset your password.",
      code: "TOO_MANY_REQUESTS",
    };
  }

  if (errCode === "auth/user-disabled" || /user-disabled/i.test(errMessage)) {
    return {
      title: "Account Disabled",
      message: "This account has been disabled. Please contact support.",
      code: "USER_DISABLED",
    };
  }

  if (errCode === "auth/network-request-failed" || /network-request-failed/i.test(errMessage)) {
    return {
      title: "Connection Error",
      message: "Unable to connect right now. Please check your internet connection and try again.",
      code: "NETWORK_ERROR",
    };
  }

  if (isAxiosError(error)) {
    // 1. Network / connectivity error (client offline or server unreachable)
    if (
      error.message === "Network Error" ||
      error.code === "ECONNABORTED" ||
      error.code === "ERR_NETWORK" ||
      !error.response
    ) {
      return {
        title: "Connection Error",
        message: "Unable to connect right now. Please check your internet connection and try again.",
        code: "NETWORK_ERROR",
      };
    }

    const status = error.response?.status;
    const data = error.response?.data as { code?: string; message?: string; error?: string } | undefined;
    const rawMessage = data?.message || data?.error || "";
    const code = data?.code;

    // 2. Google-only account attempting password login
    if (code === "GOOGLE_SIGN_IN_REQUIRED" || /Google Sign-In/i.test(rawMessage)) {
      return {
        title: "Account Registered with Google",
        message: "You created your account using Google. Please continue with Google to sign in.",
        code: "GOOGLE_SIGN_IN_REQUIRED",
      };
    }

    // 3. Explicit account linking error codes
    if (code === "EMAIL_MISMATCH") {
      return {
        title: "Email Mismatch",
        message: rawMessage || "Google account email does not match your registered account email.",
        code: "EMAIL_MISMATCH",
      };
    }

    if (code === "GOOGLE_ACCOUNT_ALREADY_LINKED" || code === "ACCOUNT_ALREADY_LINKED") {
      return {
        title: "Account Already Linked",
        message: rawMessage || "This Google identity is already linked to another Lunari account.",
        code,
      };
    }

    // 4. Account conflict (409 Conflict / ACCOUNT_LINK_REQUIRED)
    if (status === 409 || code === "ACCOUNT_LINK_REQUIRED") {
      return {
        title: "Account Already Exists",
        message:
          rawMessage ||
          "An account with this email address already exists. Please sign in with your original authentication provider.",
        code: "ACCOUNT_LINK_REQUIRED",
      };
    }

    // 4. Invalid credentials (401 or login credential mismatch)
    if (
      status === 401 ||
      (status === 400 && /invalid.*(password|email|credentials)|incorrect.*password/i.test(rawMessage))
    ) {
      return {
        title: "Sign In Error",
        message: "Your email or password is incorrect.",
        code: "INVALID_CREDENTIALS",
      };
    }

    // 5. Client validation errors (400) if safe and human-readable
    if (
      status === 400 &&
      rawMessage &&
      !/syntax|database|constraint|relation|column|query|stack|internal|sql/i.test(rawMessage)
    ) {
      return {
        title: "Notice",
        message: rawMessage,
        code,
      };
    }

    // 6. Unknown / server error (500, etc.)
    if (status && status >= 500) {
      return {
        title: "Server Notice",
        message: "Something went wrong on the server. Please try again later.",
        code: code || "SERVER_ERROR",
      };
    }

    return {
      title: "Notice",
      message: fallback,
      code,
    };
  }

  if (error instanceof Error) {
    if (/network|offline|timeout|fetch/i.test(error.message)) {
      return {
        title: "Connection Error",
        message: "Unable to connect right now. Please check your internet connection and try again.",
        code: "NETWORK_ERROR",
      };
    }
  }

  return {
    title: "Notice",
    message: fallback,
  };
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  return getAuthErrorDetails(error, fallback).message;
}

/**
 * Register a new user account.
 * Integrates with Firebase Authentication for email/password user creation,
 * then creates corresponding PostgreSQL user record with verified Firebase UID.
 * Endpoint: POST /api/auth/signup
 */
export async function signup(payload: SignupRequest): Promise<AuthResponse> {
  let idToken: string | undefined;
  let createdFirebaseUser: any = null;

  try {
    const { isFirebaseClientConfigured, getFirebaseAuth } = await import("@/config/firebase");
    if (isFirebaseClientConfigured()) {
      const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
      const auth = getFirebaseAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        payload.email.trim(),
        payload.password
      );
      createdFirebaseUser = userCredential.user;

      if (payload.name?.trim()) {
        await updateProfile(userCredential.user, {
          displayName: payload.name.trim(),
        }).catch(() => {});
      }

      idToken = await userCredential.user.getIdToken();
    }
  } catch (fbError: any) {
    if (fbError?.code?.startsWith("auth/")) {
      throw fbError;
    }
    if (__DEV__) {
      console.warn("[auth.service] Firebase signup client fallback:", fbError);
    }
  }

  try {
    const response = await api.post<AuthResponse>("/api/auth/signup", {
      ...payload,
      ...(idToken ? { idToken } : {}),
    });

    if (response.data.data?.token) {
      await saveAuthToken(response.data.data.token);
    }
    if (response.data.data?.user) {
      await saveAuthUser(response.data.data.user);
    }
    return response.data;
  } catch (apiError) {
    // If backend database insertion failed but Firebase user was created, roll back Firebase user
    if (createdFirebaseUser && typeof createdFirebaseUser.delete === "function") {
      await createdFirebaseUser.delete().catch(() => {});
    }
    throw apiError;
  }
}

/**
 * Authenticate existing user with email and password.
 * Authenticates with Firebase Auth to obtain verified ID token,
 * exchanging it with backend for Lunari session JWT.
 * Endpoint: POST /api/auth/login
 */
export async function login(payload: LoginRequest): Promise<AuthResponse> {
  let idToken: string | undefined;

  try {
    const { isFirebaseClientConfigured, getFirebaseAuth } = await import("@/config/firebase");
    if (isFirebaseClientConfigured()) {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const auth = getFirebaseAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        payload.email.trim(),
        payload.password
      );
      idToken = await userCredential.user.getIdToken();
    }
  } catch (fbError: any) {
    if (fbError?.code?.startsWith("auth/")) {
      throw fbError;
    }
    if (__DEV__) {
      console.warn("[auth.service] Firebase login client fallback:", fbError);
    }
  }

  const response = await api.post<AuthResponse>("/api/auth/login", {
    ...payload,
    ...(idToken ? { idToken } : {}),
  });

  if (response.data.data?.token) {
    await saveAuthToken(response.data.data.token);
  }
  if (response.data.data?.user) {
    await saveAuthUser(response.data.data.user);
  }
  return response.data;
}

/**
 * Send password reset email via Firebase Authentication.
 */
export async function forgotPassword(email: string): Promise<void> {
  const normalizedEmail = email.trim();
  const { isFirebaseClientConfigured, getFirebaseAuth } = await import("@/config/firebase");
  if (isFirebaseClientConfigured()) {
    const { sendPasswordResetEmail } = await import("firebase/auth");
    const auth = getFirebaseAuth();
    await sendPasswordResetEmail(auth, normalizedEmail);
  }
}

/**
 * Invalidate current session and remove local auth state.
 * Signs out from Lunari API, Firebase Auth, and GoogleSignin.
 * Endpoint: POST /api/auth/logout
 */
export async function logout(): Promise<LogoutResponse> {
  try {
    const response = await api.post<LogoutResponse>("/api/auth/logout");
    return response.data;
  } finally {
    // 1. Sign out from Firebase Auth
    try {
      const { isFirebaseClientConfigured, getFirebaseAuth } = await import(
        "@/config/firebase"
      );
      if (isFirebaseClientConfigured()) {
        const { signOut } = await import("firebase/auth");
        await signOut(getFirebaseAuth());
      }
    } catch {}

    // 2. Sign out from GoogleSignin
    if (Platform.OS !== "web") {
      try {
        const { GoogleSignin } = await import(
          "@react-native-google-signin/google-signin"
        );
        if (GoogleSignin && typeof GoogleSignin.signOut === "function") {
          await GoogleSignin.signOut();
        }
      } catch {}
    }

    // 3. Clear stored credentials and user data
    await clearAuthToken();
    await clearAuthUser();
  }
}

/**
 * Fetch current authenticated user and profile.
 * Endpoint: GET /api/auth/me
 */
export async function getCurrentUser(): Promise<CurrentUserResponse> {
  const response = await api.get<CurrentUserResponse>("/api/auth/me");
  if (response.data.data?.user) {
    await saveAuthUser(response.data.data.user);
  }
  return response.data;
}

/**
 * Authenticate with Google ID token.
 * Endpoint: POST /api/auth/google
 */
export async function googleLogin(idToken: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/api/auth/google", { idToken });
  if (response.data.data?.token) {
    await saveAuthToken(response.data.data.token);
  }
  if (response.data.data?.user) {
    await saveAuthUser(response.data.data.user);
  }
  return response.data;
}

/**
 * Securely link Google identity to the currently authenticated user.
 * Endpoint: POST /api/auth/link-google
 */
export async function linkGoogle(idToken: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/api/auth/link-google", { idToken });
  if (response.data.data?.user) {
    await saveAuthUser(response.data.data.user);
  }
  return response.data;
}

export const authService = {
  signup,
  login,
  forgotPassword,
  googleLogin,
  linkGoogle,
  logout,
  getCurrentUser,
  getAuthErrorDetails,
  getApiErrorMessage,
};

export default authService;
