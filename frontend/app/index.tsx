import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Redirect } from "expo-router";
import { clearAuthToken, clearAuthUser, getAuthToken, getAuthUser } from "@/lib/storage";
import { authService } from "@/services/auth.service";
import { profileService } from "@/services/profile.service";
import { AuthUser, extractOnboardingStatus } from "@/types/auth";
import { logAuthDiagnostic } from "@/utils/devAuthLogger";
import { colors } from "@/theme/colors";

type AppDestination = "checking" | "welcome" | "onboarding" | "dashboard";

export default function Index() {
  const [destination, setDestination] = useState<AppDestination>("checking");

  useEffect(() => {
    let isMounted = true;

    async function determineInitialRoute() {
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
              navigationGuard: "RootGuard",
              redirectDecision: "/(auth)/welcome",
              decisionReason: "No session token exists in storage",
            });
          }
          if (isMounted) setDestination("welcome");
          return;
        }

        // Fetch verified user from GET /api/auth/me
        let user: AuthUser | undefined;
        let httpStatus: number | undefined;
        let cached = await getAuthUser();

        try {
          const res = await authService.getCurrentUser();
          httpStatus = 200;
          user = res.data?.user;
        } catch (err: any) {
          httpStatus = err?.response?.status;
          // If token was rejected with 401 Unauthorized, clear stale session and send to welcome
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
                navigationGuard: "RootGuard",
                redirectDecision: "/(auth)/welcome",
                decisionReason: "Session token expired or invalid (HTTP 401)",
              });
            }
            if (isMounted) setDestination("welcome");
            return;
          }

          // Network or transient server error: fallback to cached user
          user = cached || undefined;
        }

        if (!user) {
          if (isMounted) setDestination("welcome");
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
            navigationGuard: "RootGuard",
            redirectDecision: backendStatus.isCompleted ? "/(app)/dashboard" : "/onboarding",
            decisionReason: backendStatus.isCompleted
              ? "User profile has onboarding_completed = true"
              : "User profile has onboarding_completed = false (requires onboarding)",
          });
        }

        if (backendStatus.isCompleted) {
          // Sync existing period history in background so dashboard has complete history
          profileService.syncUserData(user).catch(() => {});
          if (isMounted) setDestination("dashboard");
        } else {
          if (isMounted) setDestination("onboarding");
        }
      } catch (err) {
        console.warn("[Index] Failed to evaluate initial navigation:", err);
        if (isMounted) setDestination("welcome");
      }
    }

    determineInitialRoute();

    return () => {
      isMounted = false;
    };
  }, []);

  if (destination === "checking") {
    return <View style={{ flex: 1, backgroundColor: colors.white }} />;
  }

  if (destination === "dashboard") {
    return <Redirect href="/(app)/dashboard" />;
  }

  if (destination === "onboarding") {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
