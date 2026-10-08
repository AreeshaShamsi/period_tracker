export const opacity = {
  disabled: 0.4,
  secondary: 0.6,
  pressed: 0.7,
  overlay: 0.5,
  selected: 0.15,
} as const;

export type Opacity = keyof typeof opacity;
