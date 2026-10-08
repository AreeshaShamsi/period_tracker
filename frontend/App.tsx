import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { colors } from "@/theme/colors";
import { useOnboarding } from "@/state/OnboardingContext";
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
  const { onboardingData, isLoadingStorage } = useOnboarding();
  const [route, setRoute] = useState<RouteState | null>(null);

  useEffect(() => {
    if (!isLoadingStorage) {
      if (onboardingData.name && onboardingData.lastPeriodDays.length > 0) {
        setRoute("dashboard");
      } else {
        setRoute("welcome");
      }
    }
  }, [isLoadingStorage, onboardingData]);

  if (isLoadingStorage || route === null) {
    return <View style={{ flex: 1, backgroundColor: colors.white }} />;
  }

  if (route === "dashboard") {
    return (
      <DashboardScreen
        onProfile={() => console.log("Profile pressed")}
        onQuickLog={(type) => console.log("Quick log type:", type)}
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
        onSignInSuccess={() => setRoute("dashboard")}
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
    />
  );
}

export default function App() {
  return <AppContent />;
}
