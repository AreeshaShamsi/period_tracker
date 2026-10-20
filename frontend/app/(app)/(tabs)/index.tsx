import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Redirect } from "expo-router";
import { useOnboarding } from "@/state/OnboardingContext";
import { authService } from "@/services/auth.service";
import { clearAuthToken, clearAuthUser, getAuthToken, getAuthUser } from "@/lib/storage";
import { AuthUser, extractOnboardingStatus } from "@/types/auth";
import { logAuthDiagnostic } from "@/utils/devAuthLogger";
import { colors } from "@/theme/colors";
import DashboardScreen from "@/screens/DashboardScreen";

type TabAuthStatus = "checking" | "onboarded" | "needs_onboarding" | "unauthenticated";

export default function HomeTabRoute() {
  const { isLoaded, syncWithServer } = useOnboarding();
  const [status, setStatus] = useState<TabAuthStatus>("checking");

  useEffect(() => {
    let isMounted = true;

    async function evaluateOnboarding() {
      try {
        const token = await getAuthToken();
        if (!token) {
          if (__DEV__) {
            logAuthDiagnostic({
              authMethod: "unknown",
              hasSessionToken: false,
              meHttpStatus: null,
              responseStructure: {
                hasProfileObject: false,
                onboardingCompletedValue: undefined,
              },
              profileState: "missing",
              isLocalCacheOverridingBackend: false,
              navigationGuard: "DashboardGuard",
              redirectDecision: "/(auth)/welcome",
              decisionReason: "No session token in storage",
            });
          }
          if (isMounted) setStatus("unauthenticated");
          return;
        }

        // 1. Fetch fresh verified user profile from backend GET /api/auth/me FIRST
        // This ensures fresh backend state always takes precedence over stale cache
        let user: AuthUser | undefined;
        let httpStatus: number | undefined;
        let cached = await getAuthUser();

        try {
          const res = await authService.getCurrentUser();
          httpStatus = 200;
          user = res.data?.user;
        } catch (err: any) {
          httpStatus = err?.response?.status;
          if (httpStatus === 401) {
            await clearAuthToken();
            await clearAuthUser();
            if (__DEV__) {
              logAuthDiagnostic({
                authMethod: "session_token",
                hasSessionToken: true,
                meHttpStatus: 401,
                responseStructure: {
                  hasProfileObject: false,
                  onboardingCompletedValue: undefined,
                },
                profileState: "missing",
                isLocalCacheOverridingBackend: false,
                navigationGuard: "DashboardGuard",
                redirectDecision: "/(auth)/welcome",
                decisionReason: "Session token rejected with 401 Unauthorized",
              });
            }
            if (isMounted) setStatus("unauthenticated");
            return;
          }

          // Network or transient server error: fallback to cached user
          user = cached || undefined;
        }

        if (!user) {
          if (isMounted) setStatus("unauthenticated");
          return;
        }

        const backendStatus = extractOnboardingStatus(user);
        const cachedStatus = extractOnboardingStatus(cached);
        const isCacheOverriding = cached && user && cachedStatus.isCompleted !== backendStatus.isCompleted;

        if (__DEV__) {
          logAuthDiagnostic({
            authMethod: user.auth_providers?.includes("google") ? "google" : "email_password",
            hasSessionToken: true,
            meHttpStatus: httpStatus,
            responseStructure: {
              hasProfileObject: backendStatus.hasProfile,
              onboardingCompletedValue: backendStatus.rawStatus,
              sourceProperty: backendStatus.sourceProperty,
            },
            profileState: backendStatus.profileState,
            isLocalCacheOverridingBackend: Boolean(isCacheOverriding),
            navigationGuard: "DashboardGuard",
            redirectDecision: backendStatus.isCompleted ? "/(app)/dashboard" : "/onboarding",
            decisionReason: backendStatus.isCompleted
              ? "User profile has onboarding_completed = true"
              : "User profile has onboarding_completed = false (requires onboarding)",
          });
        }

        if (backendStatus.isCompleted) {
          if (isMounted) setStatus("onboarded");
          syncWithServer(user).catch(() => {});
        } else {
          // Genuinely incomplete onboarding
          if (isMounted) setStatus("needs_onboarding");
        }
      } catch (err) {
        console.warn("[DashboardGuard] Error evaluating onboarding status:", err);
        // Do NOT treat unexpected errors as proof that onboarding is incomplete!
        // Fall back to local cache if available and completed
        const cached = await getAuthUser();
        const cachedStatus = extractOnboardingStatus(cached);
        if (cachedStatus.isCompleted) {
          if (isMounted) setStatus("onboarded");
        } else {
          if (isMounted) setStatus("needs_onboarding");
        }
      }
    }

    evaluateOnboarding();

    return () => {
      isMounted = false;
    };
  }, [syncWithServer]);

  if (status === "checking" || !isLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.white }} />;
  }

  if (status === "unauthenticated") {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (status === "needs_onboarding") {
    return <Redirect href="/onboarding" />;
  }

  return <DashboardScreen />;
}
