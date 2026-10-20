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
        message: "This email is already registered with a password. Sign in to your existing account first, then link Google to use either sign-in method.",
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
 * Endpoint: POST /api/auth/signup
 */
export async function signup(payload: SignupRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/api/auth/signup", payload);
  if (response.data.data?.token) {
    await saveAuthToken(response.data.data.token);
  }
  if (response.data.data?.user) {
    await saveAuthUser(response.data.data.user);
  }
  return response.data;
}

/**
 * Authenticate existing user with email and password.
 * Endpoint: POST /api/auth/login
 */
export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/api/auth/login", payload);
  if (response.data.data?.token) {
    await saveAuthToken(response.data.data.token);
  }
  if (response.data.data?.user) {
    await saveAuthUser(response.data.data.user);
  }
  return response.data;
}

/**
 * Invalidate current session and remove local auth state.
 * Endpoint: POST /api/auth/logout
 */
export async function logout(): Promise<LogoutResponse> {
  try {
    const response = await api.post<LogoutResponse>("/api/auth/logout");
    return response.data;
  } finally {
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
  googleLogin,
  linkGoogle,
  logout,
  getCurrentUser,
  getAuthErrorDetails,
  getApiErrorMessage,
};

export default authService;
