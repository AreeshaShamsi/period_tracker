import React from "react";
import { Pressable, View, ViewProps, ViewStyle } from "react-native";
import { colors } from "@/theme/colors";
import { radius, Radius } from "@/theme/radius";
import { shadows, ShadowVariant } from "@/theme/shadows";

export type CardVariant = "default" | "soft" | "outlined";

export interface AppCardProps extends ViewProps {
  variant?: CardVariant;
  cardRadius?: Radius;
  shadow?: ShadowVariant;
  padding?: "none" | "small" | "medium" | "large";
  onPress?: () => void;
  style?: ViewStyle;
  className?: string;
  children?: React.ReactNode;
}

export const AppCard: React.FC<AppCardProps> = ({
  variant = "default",
  cardRadius = "large",
  shadow = "subtle",
  padding = "medium",
  onPress,
  style,
  className = "",
  children,
  ...props
}) => {
  const getPaddingValue = () => {
    switch (padding) {
      case "none":
        return 0;
      case "small":
        return 12;
      case "medium":
        return 16;
      case "large":
        return 24;
    }
  };

  const getCardStyle = (): ViewStyle => {
    const baseRadius = radius[cardRadius];
    const p = getPaddingValue();

    switch (variant) {
      case "default":
        return {
          backgroundColor: colors.background.card,
          borderRadius: baseRadius,
          padding: p,
          borderWidth: 1,
          borderColor: colors.border.subtle,
          ...shadows[shadow],
        };
      case "soft":
        return {
          backgroundColor: colors.brand.soft,
          borderRadius: baseRadius,
          padding: p,
          borderWidth: 0,
        };
      case "outlined":
        return {
          backgroundColor: colors.background.card,
          borderRadius: baseRadius,
          padding: p,
          borderWidth: 1,
          borderColor: colors.border.primary,
        };
    }
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [
          getCardStyle(),
          pressed && { opacity: 0.85 },
          style,
        ]}
        className={className}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[getCardStyle(), style]} className={className} {...props}>
      {children}
    </View>
  );
};
