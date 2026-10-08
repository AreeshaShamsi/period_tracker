import React from "react";
import Svg, { Circle, Path } from "react-native-svg";
import { colors } from "@/theme/colors";
import { IconProps } from "./types";

export const MoodIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.primary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.8} />
    <Path
      d="M8 15s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
