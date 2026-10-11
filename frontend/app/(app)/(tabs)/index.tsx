import React from "react";
import { Redirect } from "expo-router";
import { useOnboarding } from "@/state/OnboardingContext";
import DashboardScreen from "@/screens/DashboardScreen";

export default function HomeTabRoute() {
  const { onboardingData, isLoaded } = useOnboarding();

  const hasCompletedOnboarding =
    Boolean(onboardingData?.name) &&
    Array.isArray(onboardingData?.lastPeriodDays) &&
    onboardingData.lastPeriodDays.length > 0;

  if (isLoaded && !hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return <DashboardScreen />;
}
