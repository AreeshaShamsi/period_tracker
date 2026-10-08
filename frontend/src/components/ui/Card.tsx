import React from "react";
import { View, ViewStyle } from "react-native";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";

export interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "soft";
  style?: ViewStyle;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  style,
  className = "",
}) => {
  const isSoft = variant === "soft";

  return (
    <View
      style={[
        {
          backgroundColor: isSoft ? colors.primarySoft : colors.white,
          borderRadius: radius.card,
          padding: spacing.lg,
          borderWidth: isSoft ? 0 : 1,
          borderColor: isSoft ? "transparent" : colors.separator,
        },
        style,
      ]}
      className={className}
    >
      {children}
    </View>
  );
};
