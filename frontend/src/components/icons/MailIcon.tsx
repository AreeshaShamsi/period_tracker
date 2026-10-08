import React from "react";
import Svg, { Path, Rect } from "react-native-svg";
import { colors } from "@/theme/colors";
import { IconProps } from "./types";

export const MailIcon: React.FC<IconProps> = ({
  size = 20,
  color = colors.inputIcon,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="3"
      stroke={color}
      strokeWidth={1.8}
    />
    <Path
      d="M3 7L12 13L21 7"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
