import React from "react";
import { useRouter } from "expo-router";
import SetupScreen from "@/screens/SetupScreen";

export default function SetupRoute() {
  const router = useRouter();

  const handleComplete = () => {
    router.replace("/(app)/dashboard" as any);
  };

  return <SetupScreen onComplete={handleComplete} />;
}
