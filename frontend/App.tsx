import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { colors } from "@/theme/colors";
import { useOnboarding } from "@/state/OnboardingContext";
import { getAuthToken, getAuthUser } from "@/lib/storage";
import { authService } from "@/services/auth.service";
import { AuthUser, extractOnboardingStatus } from "@/types/auth";
import { logAuthDiagnostic } from "@/utils/devAuthLogger";
import WelcomeScreen from "./app/(auth)/welcome";
import CreateAccountScreen from "./screens/CreateAccountScreen";
import SignInScreen from "./screens/SignInScreen";
import OnboardingFlow from "./screens/onboarding/OnboardingFlow";
import SetupScreen from "./screens/SetupScreen";
import DashboardScreen from "./screens/DashboardScreen";

export type RouteState =
  | "welcome"
  | "createAccount"
  | "signIn"
  | "onboarding"
  | "setup"
  | "dashboard";

function AppContent() {
  const { isLoadingStorage } = useOnboarding();
  const [route, setRoute] = useState<RouteState | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function evaluateAppRoute() {
      if (isLoadingStorage) return;

      try {
        const token = await getAuthToken();
        if (!token) {
          if (isMounted) setRoute("welcome");
          return;
        }

        let user: AuthUser | undefined;
        try {
          const res = await authService.getCurrentUser();
          user = res.data?.user;
        } catch {
          const cached = await getAuthUser();
          user = cached || undefined;
        }

        if (!user) {
          if (isMounted) setRoute("welcome");
          return;
        }

        const statusInfo = extractOnboardingStatus(user);
        if (isMounted) {
          setRoute(statusInfo.isCompleted ? "dashboard" : "onboarding");
        }
      } catch (err) {
        if (isMounted) setRoute("welcome");
      }
    }

    evaluateAppRoute();

    return () => {
      isMounted = false;
    };
  }, [isLoadingStorage]);

  if (isLoadingStorage || route === null) {
    return <View style={{ flex: 1, backgroundColor: colors.white }} />;
  }

  if (route === "dashboard") {
    return (
      <DashboardScreen
        onProfile={() => console.log("Profile pressed")}
        onQuickLog={(type: string) => console.log("Quick log type:", type)}
      />
    );
  }

  if (route === "setup") {
    return <SetupScreen onComplete={() => setRoute("dashboard")} />;
  }

  if (route === "onboarding") {
    return (
      <OnboardingFlow
        onBackToAccount={() => setRoute("createAccount")}
        onFinishOnboarding={() => setRoute("setup")}
      />
    );
  }

  if (route === "signIn") {
    return (
      <SignInScreen
        onBack={() => setRoute("welcome")}
        onSignInSuccess={(user) => {
          const statusInfo = extractOnboardingStatus(user);
          setRoute(statusInfo.isCompleted ? "dashboard" : "onboarding");
        }}
        onSignUp={() => setRoute("createAccount")}
        onForgotPassword={() => console.log("Forgot password pressed")}
      />
    );
  }

  if (route === "createAccount") {
    return (
      <CreateAccountScreen
        onBack={() => setRoute("welcome")}
        onSignIn={() => setRoute("signIn")}
        onSignUp={() => setRoute("onboarding")}
        onTerms={() => console.log("Terms pressed")}
      />
    );
  }

  return (
    <WelcomeScreen
      onEmail={() => setRoute("createAccount")}
      onSignIn={() => setRoute("signIn")}
      onGoogleSuccess={() => {
        getAuthUser().then((user) => {
          const statusInfo = extractOnboardingStatus(user);
          setRoute(statusInfo.isCompleted ? "dashboard" : "onboarding");
        });
      }}
    />
  );
}

export default function App() {
  return <AppContent />;
}
