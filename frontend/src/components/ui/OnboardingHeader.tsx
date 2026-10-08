import React from "react";
import { Pressable, View } from "react-native";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { ArrowLeftIcon } from "@/components/icons";
import { AppText } from "./AppText";
import { ProgressBar } from "./ProgressBar";

export interface OnboardingHeaderProps {
  step: number;
  total: number;
  onBack: () => void;
}

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({
  step,
  total,
  onBack,
}) => {
  return (
    <View
      style={{
        height: 44,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Pressable
        onPress={onBack}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <ArrowLeftIcon size={24} color={colors.textPrimary} />
      </Pressable>

      <View style={{ width: spacing.lg }} />

      <ProgressBar progress={step / total} />

      <View style={{ width: spacing.lg }} />

      <AppText variant="counter">
        {step} / {total}
      </AppText>
    </View>
  );
};
