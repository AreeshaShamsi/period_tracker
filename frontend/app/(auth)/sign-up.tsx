import React from "react";
import { useRouter } from "expo-router";
import CreateAccountScreen from "@/screens/CreateAccountScreen";

export default function SignUpRoute() {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(auth)/welcome");
    }
  };

  return (
    <CreateAccountScreen
      onBack={handleBack}
      onSignIn={() => router.push("/(auth)/sign-in")}
      onSignUp={() => router.replace("/onboarding" as any)}
      onTerms={() => console.log("Terms pressed")}
    />
  );
}
