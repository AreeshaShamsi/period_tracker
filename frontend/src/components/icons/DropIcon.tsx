import React from "react";
import Svg, { Path } from "react-native-svg";
import { colors } from "@/theme/colors";
import { IconProps } from "./types";

export const DropIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.primary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
