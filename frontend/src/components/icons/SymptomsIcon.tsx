import React from "react";
import Svg, { Path } from "react-native-svg";
import { colors } from "@/theme/colors";
import { IconProps } from "./types";

export const SymptomsIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.primary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
