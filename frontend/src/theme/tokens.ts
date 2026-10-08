import { colors } from "./colors";
import { typography } from "./typography";
import { spacing } from "./spacing";
import { radius } from "./radius";
import { shadows } from "./shadows";
import { sizes } from "./sizes";
import { opacity } from "./opacity";
import { animation } from "./animation";

export const tokens = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  sizes,
  opacity,
  animation,
} as const;

export type Tokens = typeof tokens;
