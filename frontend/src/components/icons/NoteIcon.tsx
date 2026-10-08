import React from "react";
import Svg, { Path, Rect } from "react-native-svg";
import { colors } from "@/theme/colors";
import { IconProps } from "./types";

export const NoteIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.primary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="4"
      y="4"
      width="16"
      height="16"
      rx="2"
      stroke={color}
      strokeWidth={1.8}
    />
    <Path
      d="M8 9h8M8 13h5"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);
