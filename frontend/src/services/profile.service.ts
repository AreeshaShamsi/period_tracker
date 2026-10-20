import { api } from "./api";
import { authService } from "./auth.service";
import {
  getAuthUser,
  loadLogs,
  loadOnboarding,
  saveAuthUser,
  saveLogs,
  saveOnboarding,
} from "@/lib/storage";
import { AuthUser, extractOnboardingStatus } from "@/types/auth";
import { OnboardingData, UserLogs } from "@/types/onboarding";

export interface CompleteOnboardingPayload {
  name?: string;
  birthYear?: number;
  averageCycleLength?: number;
  averagePeriodDuration?: number;
  lastPeriodDays?: string[];
}

export interface ProfileData {
  user_id: string;
  name: string;
  email: string;
  birth_year: number | null;
  average_cycle_length: number;
  average_period_duration: number;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface PeriodRecord {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  duration_days: number | null;
  is_ongoing: boolean;
}

/**
 * Service for profile management, onboarding persistence, and user cycle data syncing
 */
export const profileService = {
  /**
   * Complete onboarding and persist profile and period tracking records to backend database.
   * Endpoint: POST /api/profile/onboarding
   */
  async completeOnboarding(
    payload: CompleteOnboardingPayload
  ): Promise<{ user: AuthUser }> {
    const response = await api.post<{
      status: string;
      message: string;
      data: { user: AuthUser };
    }>("/api/profile/onboarding", payload);

    const user = response.data.data?.user;
    if (user) {
      await saveAuthUser(user);
    }
    return { user };
  },

  /**
   * Get authenticated user profile.
   * Endpoint: GET /api/profile
   */
  async getProfile(): Promise<ProfileData> {
    const response = await api.get<{
      status: string;
      data: { profile: ProfileData };
    }>("/api/profile");
    return response.data.data.profile;
  },

  /**
   * Update authenticated user profile fields.
   * Endpoint: PUT /api/profile
   */
  async updateProfile(
    payload: Partial<{
      name: string;
      birthYear: number;
      averageCycleLength: number;
      averagePeriodDuration: number;
      onboardingCompleted: boolean;
    }>
  ): Promise<ProfileData> {
    const response = await api.put<{
      status: string;
      data: { profile: ProfileData };
    }>("/api/profile", payload);
    return response.data.data.profile;
  },

  /**
   * Retrieve logged periods for authenticated user.
   * Endpoint: GET /api/periods
   */
  async getPeriods(): Promise<PeriodRecord[]> {
    try {
      const response = await api.get<{
        status: string;
        data: { periods: PeriodRecord[] };
      }>("/api/periods?limit=50&sort=desc");
      return response.data.data?.periods || [];
    } catch {
      return [];
    }
  },

  /**
   * Synchronize authenticated user profile, onboarding state, and period history from backend.
   * Loads saved history into local storage so dashboard displays real records without requiring onboarding questions.
   */
  async syncUserData(existingUser?: AuthUser): Promise<{
    user: AuthUser;
    onboardingCompleted: boolean;
  }> {
    let user = existingUser;

    // 1. Fetch verified user from GET /api/auth/me if not provided
    if (!user) {
      try {
        const meRes = await authService.getCurrentUser();
        user = meRes.data?.user;
      } catch {
        // Fallback to cached user if offline
        const cached = await getAuthUser();
        if (cached) user = cached;
      }
    }

    if (!user) {
      throw new Error("No authenticated user session.");
    }

    const statusInfo = extractOnboardingStatus(user);
    const isOnboarded = statusInfo.isCompleted;

    if (isOnboarded) {
      // 2. Load existing period logs from backend
      const periods = await this.getPeriods();
      const allPeriodDays: string[] = [];

      periods.forEach((p) => {
        if (p.start_date) {
          allPeriodDays.push(p.start_date);
          if (p.end_date && p.end_date >= p.start_date) {
            const start = new Date(p.start_date);
            const end = new Date(p.end_date);
            const curr = new Date(start);
            curr.setDate(curr.getDate() + 1);
            while (curr <= end) {
              const iso = curr.toISOString().split("T")[0];
              if (!allPeriodDays.includes(iso)) {
                allPeriodDays.push(iso);
              }
              curr.setDate(curr.getDate() + 1);
            }
          }
        }
      });
      allPeriodDays.sort();

      const existingOnboarding = await loadOnboarding();
      const existingLogs = await loadLogs();

      const syncedPeriodDays = allPeriodDays.length > 0
        ? allPeriodDays
        : (existingOnboarding?.lastPeriodDays || []);

      const syncedOnboardingData: OnboardingData = {
        name: user.name || existingOnboarding?.name || "",
        birthday: {
          month: existingOnboarding?.birthday?.month || 1,
          day: existingOnboarding?.birthday?.day || 1,
          year: user.profile?.birth_year || existingOnboarding?.birthday?.year || 1995,
        },
        periodLength: user.profile?.average_period_duration || existingOnboarding?.periodLength || 4,
        cycleType: existingOnboarding?.cycleType || "regular",
        cycleLength: user.profile?.average_cycle_length || existingOnboarding?.cycleLength || 28,
        cycleLengthMin: existingOnboarding?.cycleLengthMin || 26,
        cycleLengthMax: existingOnboarding?.cycleLengthMax || 28,
        lastPeriodDays: syncedPeriodDays.slice(-7), // recent period window
      };

      const syncedUserLogs: UserLogs = {
        periodDays: allPeriodDays.length > 0 ? allPeriodDays : (existingLogs?.periodDays || []),
        symptoms: existingLogs?.symptoms || {},
        moods: existingLogs?.moods || {},
        notes: existingLogs?.notes || {},
      };

      await saveOnboarding(syncedOnboardingData);
      await saveLogs(syncedUserLogs);
    }

    await saveAuthUser(user);

    return {
      user,
      onboardingCompleted: isOnboarded,
    };
  },
};
