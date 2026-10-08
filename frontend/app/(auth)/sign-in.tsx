import React from "react";
import { useRouter } from "expo-router";
import SignInScreen from "@/screens/SignInScreen";

export default function SignInRoute() {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(auth)/welcome");
    }
  };

  return (
    <SignInScreen
      onBack={handleBack}
      onSignInSuccess={() => router.replace("/(app)/dashboard" as any)}
      onSignUp={() => router.push("/(auth)/sign-up")}
      onForgotPassword={() => router.push("/(auth)/forgot-password")}
    />
  );
}
