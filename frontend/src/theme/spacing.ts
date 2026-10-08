export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  gap48: 48,
  gap60: 60,
  gap64: 64,
  huge: 80,
} as const;

export type Spacing = keyof typeof spacing;
