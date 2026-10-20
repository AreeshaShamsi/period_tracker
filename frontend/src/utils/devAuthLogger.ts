/**
 * Development-Only Diagnostics Logger for Lunari Authentication & Navigation Guards
 *
 * Strict Security Controls:
 * - Operates ONLY when __DEV__ is true.
 * - NEVER logs passwords, JWTs, Google ID tokens, refresh tokens, or PII.
 * - Captures exact response structures, profile existence, cache status, and routing guard decisions.
 */

export interface AuthDiagnosticParams {
  authMethod: "email_password" | "google" | "session_token" | "cached_session" | "unknown";
  hasSessionToken: boolean;
  meHttpStatus?: number | string | null;
  responseStructure: {
    hasProfileObject: boolean;
    onboardingCompletedValue: boolean | null | undefined;
    sourceProperty?: string;
  };
  profileState: "missing" | "null" | "true" | "false";
  isLocalCacheOverridingBackend: boolean;
  navigationGuard: "RootGuard" | "DashboardGuard" | "SignInScreen" | "WelcomeScreen" | "AppContent";
  redirectDecision: "/(app)/dashboard" | "/onboarding" | "/(auth)/welcome" | "none";
  decisionReason: string;
}

export function logAuthDiagnostic(params: AuthDiagnosticParams): void {
  if (!__DEV__) return;

  const summary = [
    `\n═══════════════ [Lunari Auth & Guard Diagnostic] ═══════════════`,
    `• Authentication Method Used:             ${params.authMethod}`,
    `• Valid Session Token Exists:             ${params.hasSessionToken ? "YES (present)" : "NO (missing)"}`,
    `• HTTP Status of /api/auth/me:            ${params.meHttpStatus !== undefined && params.meHttpStatus !== null ? params.meHttpStatus : "N/A (offline or bypassed)"}`,
    `• Response Structure for onboarding:      ${JSON.stringify(params.responseStructure)}`,
    `• Profile State (onboarding_completed):   ${params.profileState.toUpperCase()}`,
    `• Local Cache Overriding Backend:         ${params.isLocalCacheOverridingBackend ? "YES [WARNING: Stale cache override]" : "NO (Fresh backend prioritized)"}`,
    `• Active Navigation Guard:                ${params.navigationGuard}`,
    `• Routing Decision:                       ${params.redirectDecision}`,
    `• Reason:                                 ${params.decisionReason}`,
    `═════════════════════════════════════════════════════════════════\n`,
  ].join("\n");

  console.log(summary);
}

export default logAuthDiagnostic;
