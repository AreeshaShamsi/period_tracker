import React from "react";
import { View, ViewStyle } from "react-native";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { AppText } from "./AppText";

export type BadgeVariant = "default" | "success" | "warning" | "error" | "pink";

export interface BadgeProps {
  label?: string;
  variant?: BadgeVariant;
  dot?: boolean;
  style?: ViewStyle;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "default",
  dot = false,
  style,
  className = "",
}) => {
  const getBadgeColors = (): { bg: string; text: string } => {
    switch (variant) {
      case "default":
        return { bg: "#F2F2F7", text: colors.text.secondary };
      case "success":
        return { bg: "#E8F8EE", text: colors.system.green };
      case "warning":
        return { bg: "#FFF4E5", text: colors.system.orange };
      case "error":
        return { bg: "#FEE8E8", text: colors.system.red };
      case "pink":
        return { bg: colors.brand.light, text: colors.brand.primary };
    }
  };

  const { bg, text } = getBadgeColors();

  if (dot) {
    return (
      <View
        style={[
          {
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: text,
          },
          style,
        ]}
        className={className}
      />
    );
  }

  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius: radius.pill,
          paddingHorizontal: 10,
          paddingVertical: 4,
          alignSelf: "flex-start",
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
      className={className}
    >
      <AppText variant="caption" weight="600" color={text}>
        {label}
      </AppText>
    </View>
  );
};
