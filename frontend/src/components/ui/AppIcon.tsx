import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "@/theme/colors";
import { iconMap, IconName } from "@/theme/icons";
import { sizes } from "@/theme/sizes";

export interface AppIconProps {
  name: IconName;
  size?: "small" | "medium" | "large" | number;
  color?: string;
  className?: string;
}

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = "medium",
  color = colors.text.primary,
  className = "",
}) => {
  const numericSize =
    typeof size === "number"
      ? size
      : size === "small"
      ? sizes.icon.small
      : size === "large"
      ? sizes.icon.large
      : sizes.icon.medium;

  const glyphName = iconMap[name] || "help-circle-outline";

  return <Ionicons name={glyphName} size={numericSize} color={color} className={className} />;
};
