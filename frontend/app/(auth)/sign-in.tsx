import React from "react";
import { useRouter } from "expo-router";
import SignInScreen from "@/screens/SignInScreen";
import { AuthUser, extractOnboardingStatus } from "@/types/auth";

export default function SignInRoute() {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(auth)/welcome");
    }
  };

  const handleSignInSuccess = (user?: AuthUser) => {
    const statusInfo = extractOnboardingStatus(user);
    if (statusInfo.isCompleted) {
      router.replace("/(app)/dashboard" as any);
    } else {
      router.replace("/onboarding" as any);
    }
  };

  return (
    <SignInScreen
      onBack={handleBack}
      onSignInSuccess={handleSignInSuccess}
      onSignUp={() => router.push("/(auth)/sign-up")}
      onForgotPassword={() => router.push("/(auth)/forgot-password")}
    />
  );
}
