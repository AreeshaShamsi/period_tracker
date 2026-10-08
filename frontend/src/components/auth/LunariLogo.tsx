import React from "react";
import { View, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors } from "@/theme/colors";

export type LogoSize = "small" | "medium" | "large" | number;

export interface AppLogoProps {
  size?: LogoSize;
  style?: ViewStyle;
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 64,
  style,
  className = "",
}) => {
  const numericSize =
    typeof size === "number"
      ? size
      : size === "small"
      ? 40
      : size === "medium"
      ? 48
      : 64;

  const brandPink = colors.primary;

  return (
    <View
      style={[
        {
          width: numericSize,
          height: numericSize,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
      className={className}
      accessibilityRole="image"
      accessibilityLabel="Lunari Logo"
    >
      <Svg width={numericSize} height={numericSize} viewBox="0 0 64 64">
        {/* Almost closed circular cycle arc with arrow at top-right */}
        <Path
          d="M 48 16 A 24 24 0 1 0 54 28"
          stroke={brandPink}
          strokeWidth={3.5}
          strokeLinecap="round"
          fill="none"
        />
        {/* Arrowhead at end of arc */}
        <Path
          d="M 52 20 L 55 29 L 46 26 Z"
          fill={brandPink}
        />

        {/* Centered water-droplet shape */}
        <Path
          d="M 32 17 C 32 17, 21.5 27.5, 21.5 34.5 C 21.5 40.3, 26.2 45, 32 45 C 37.8 45, 42.5 40.3, 42.5 34.5 C 42.5 27.5, 32 17, 32 17 Z"
          fill={brandPink}
        />

        {/* Small white highlight on lower-left of droplet */}
        <Path
          d="M 25.5 35 C 25.5 38.5, 28 41, 31 41.5"
          stroke={colors.white}
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
        />

        {/* 4-point sparkle star sitting in top-right gap */}
        <Path
          d="M 49 7 C 49 9.5, 50.5 11, 53 11 C 50.5 11, 49 12.5, 49 15 C 49 12.5, 47.5 11, 45 11 C 47.5 11, 49 9.5, 49 7 Z"
          fill={brandPink}
        />
      </Svg>
    </View>
  );
};

export const LunariLogo = AppLogo;
