import React from "react";
import Svg, { Path } from "react-native-svg";
import { colors } from "@/theme/colors";
import { IconProps } from "./types";

export const ChevronRightIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.textPrimary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 6L15 12L9 18"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
