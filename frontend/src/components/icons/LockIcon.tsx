import React from "react";
import Svg, { Path, Rect } from "react-native-svg";
import { colors } from "@/theme/colors";
import { IconProps } from "./types";

export const LockIcon: React.FC<IconProps> = ({
  size = 20,
  color = colors.inputIcon,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="5"
      y="11"
      width="14"
      height="10"
      rx="2"
      stroke={color}
      strokeWidth={1.8}
    />
    <Path
      d="M8 11V7a4 4 0 0 1 8 0v4"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);
