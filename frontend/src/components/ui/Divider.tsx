import React from "react";
import { View, ViewStyle } from "react-native";
import { colors } from "@/theme/colors";

export interface DividerProps {
  orientation?: "horizontal" | "vertical";
  color?: string;
  thickness?: number;
  spacing?: number;
  style?: ViewStyle;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = "horizontal",
  color = colors.border.primary,
  thickness = 1,
  spacing = 12,
  style,
  className = "",
}) => {
  const isHorizontal = orientation === "horizontal";

  const dividerStyle: ViewStyle = isHorizontal
    ? {
        height: thickness,
        width: "100%",
        backgroundColor: color,
        marginVertical: spacing,
      }
    : {
        width: thickness,
        height: "100%",
        backgroundColor: color,
        marginHorizontal: spacing,
      };

  return <View style={[dividerStyle, style]} className={className} />;
};
