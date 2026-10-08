import React from "react";
import Svg, { Circle, Path } from "react-native-svg";
import { colors } from "@/theme/colors";
import { IconProps } from "./types";

export const EyeIcon: React.FC<IconProps> = ({
  size = 20,
  color = colors.inputIcon,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={1.8} />
  </Svg>
);
