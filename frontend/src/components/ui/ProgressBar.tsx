import React from "react";
import { DimensionValue, View } from "react-native";
import { colors } from "@/theme/colors";

export interface ProgressBarProps {
  progress: number; // 0 to 1
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const percentage: DimensionValue = `${clampedProgress * 100}%`;

  return (
    <View
      style={{
        flex: 1,
        height: 8,
        borderRadius: 999,
        backgroundColor: colors.track,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height: "100%",
          width: percentage,
          borderRadius: 999,
          backgroundColor: colors.primary,
        }}
      />
    </View>
  );
};
