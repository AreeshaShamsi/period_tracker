import React from "react";
import { useRouter } from "expo-router";
import OnboardingFlow from "@/screens/onboarding/OnboardingFlow";

export default function OnboardingRoute() {
  const router = useRouter();

  const handleBackToAccount = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(auth)/welcome" as any);
    }
  };

  const handleFinishOnboarding = () => {
    router.replace("/setup" as any);
  };

  return (
    <OnboardingFlow
      onBackToAccount={handleBackToAccount}
      onFinishOnboarding={handleFinishOnboarding}
    />
  );
}
