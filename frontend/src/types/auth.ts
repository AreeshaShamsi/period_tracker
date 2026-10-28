export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  birthYear?: number;
  averageCycleLength?: number;
  averagePeriodDuration?: number;
  idToken?: string;
  firebaseIdToken?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  idToken?: string;
  firebaseIdToken?: string;
}

export interface AuthUserProfile {
  birth_year?: number | null;
  average_cycle_length?: number | null;
  average_period_duration?: number | null;
  onboarding_completed?: boolean;
  onboardingCompleted?: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  firebase_uid?: string | null;
  has_password?: boolean;
  is_google_linked?: boolean;
  auth_providers?: string[];
  created_at?: string;
  updated_at?: string;
  onboarding_completed?: boolean;
  onboardingCompleted?: boolean;
  profile?: AuthUserProfile;
}

export interface AuthResponse {
  status: "success" | "error";
  code?: string;
  message?: string;
  data?: {
    token: string;
    user: AuthUser;
  };
}

export interface LinkGoogleResponse {
  status: "success" | "error";
  code?: string;
  message?: string;
  data?: {
    user: AuthUser;
  };
}

export interface CurrentUserResponse {
  status: "success" | "error";
  message?: string;
  data?: {
    user: AuthUser;
  };
}

export interface LogoutResponse {
  status: "success" | "error";
  message?: string;
}

export interface ApiErrorResponse {
  status: "error";
  code?: string;
  message: string;
}

export interface OnboardingStatusDetails {
  isCompleted: boolean;
  rawStatus: boolean | null | undefined;
  hasProfile: boolean;
  profileState: "missing" | "null" | "true" | "false";
  sourceProperty?: string;
}

/**
 * Universal, bulletproof onboarding status resolver.
 * Inspects all possible response structures (snake_case, camelCase, nested in profile or top-level).
 * Guarantees that only genuine boolean `true` returns isCompleted: true.
 * Missing profiles, nulls, undefined, and false all resolve to isCompleted: false.
 */
export function extractOnboardingStatus(userOrProfile: unknown): OnboardingStatusDetails {
  if (!userOrProfile || typeof userOrProfile !== "object") {
    return {
      isCompleted: false,
      rawStatus: undefined,
      hasProfile: false,
      profileState: "missing",
    };
  }

  const obj = userOrProfile as Record<string, any>;
  const profile = obj.profile ?? (obj.user_id !== undefined ? obj : undefined);
  const hasProfile = Boolean(profile);

  let rawStatus: boolean | null | undefined = undefined;
  let sourceProperty: string | undefined = undefined;

  // 1. Check profile.onboarding_completed
  if (profile && profile.onboarding_completed !== undefined) {
    rawStatus = profile.onboarding_completed;
    sourceProperty = "profile.onboarding_completed";
  }
  // 2. Check profile.onboardingCompleted
  else if (profile && profile.onboardingCompleted !== undefined) {
    rawStatus = profile.onboardingCompleted;
    sourceProperty = "profile.onboardingCompleted";
  }
  // 3. Check top-level obj.onboarding_completed
  else if (obj.onboarding_completed !== undefined) {
    rawStatus = obj.onboarding_completed;
    sourceProperty = "onboarding_completed";
  }
  // 4. Check top-level obj.onboardingCompleted
  else if (obj.onboardingCompleted !== undefined) {
    rawStatus = obj.onboardingCompleted;
    sourceProperty = "onboardingCompleted";
  }

  const isCompleted = rawStatus === true;
  let profileState: "missing" | "null" | "true" | "false";

  if (!hasProfile) {
    profileState = "missing";
  } else if (rawStatus === null) {
    profileState = "null";
  } else if (rawStatus === true) {
    profileState = "true";
  } else {
    profileState = "false";
  }

  return {
    isCompleted,
    rawStatus,
    hasProfile,
    profileState,
    sourceProperty,
  };
}
