import React, { useEffect, useState } from "react";
import { Dimensions, View } from "react-native";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { useOnboarding } from "@/state/OnboardingContext";
import { AppText, CircularProgress, Screen } from "@/components/ui";

export interface SetupScreenProps {
  onComplete: () => void;
}

export default function SetupScreen({ onComplete }: SetupScreenProps) {
  const { onboardingData, setOnboardingData } = useOnboarding();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const duration = 3000;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const linearProgress = Math.min(elapsed / duration, 1);
      // easeInOutQuad formula
      const easedProgress =
        linearProgress < 0.5
          ? 2 * linearProgress * linearProgress
          : 1 - Math.pow(-2 * linearProgress + 2, 2) / 2;

      setProgress(easedProgress);

      if (elapsed < duration) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setProgress(1);
        setTimeout(async () => {
          await setOnboardingData(onboardingData);
          onComplete();
        }, 400);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const screenHeight = Dimensions.get("window").height;
  const percentInt = Math.round(progress * 100);

  return (
    <Screen scrollable={false} paddingHorizontal backgroundColor={colors.white}>
      <View style={{ flex: 1, alignItems: "center" }}>
        {/* Title in upper third */}
        <View
          style={{
            marginTop: screenHeight * 0.18,
            maxWidth: 280,
            alignItems: "center",
          }}
        >
          <AppText
            variant="screenTitle"
            align="center"
            style={{ fontSize: 24, lineHeight: 30 }}
          >
            We{"'"}re setting up your{"\n"}personalized calendar...
          </AppText>
        </View>

        {/* Center Circular Progress */}
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress
            size={200}
            strokeWidth={14}
            trackColor={colors.separator}
            progressColor={colors.primary}
            progress={progress}
          >
            <AppText variant="percent">{percentInt}%</AppText>
          </CircularProgress>
        </View>

        {/* Bottom Caption */}
        <View style={{ marginBottom: spacing.xl, alignItems: "center" }}>
          <AppText variant="small" align="center">
            This will just take a moment.
          </AppText>
        </View>
      </View>
    </Screen>
  );
}
