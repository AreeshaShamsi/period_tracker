import React from "react";
import Svg, { Circle } from "react-native-svg";
import { colors } from "@/theme/colors";
import { IconProps } from "./types";

export const MoreVertIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.textPrimary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Circle cx={12} cy={5} r={2} />
    <Circle cx={12} cy={12} r={2} />
    <Circle cx={12} cy={19} r={2} />
  </Svg>
);
