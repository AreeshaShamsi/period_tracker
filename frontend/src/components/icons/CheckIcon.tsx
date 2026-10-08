import React from "react";
import Svg, { Path } from "react-native-svg";
import { colors } from "@/theme/colors";
import { IconProps } from "./types";

export const CheckIcon: React.FC<IconProps> = ({
  size = 12,
  color = colors.white,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17L4 12"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
