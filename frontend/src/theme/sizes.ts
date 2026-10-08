export const sizes = {
  screenPadding: 24,
  buttonHeight: {
    small: 36,
    medium: 45,
    large: 48,
  },
  inputHeight: 46,
  icon: {
    small: 14,
    medium: 18,
    large: 24,
  },
  avatar: {
    small: 32,
    medium: 48,
    large: 56,
  },
  touchTarget: 44,
} as const;

export type Sizes = typeof sizes;
