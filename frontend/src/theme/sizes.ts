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
  recommendation: {
    cardMinHeight: 144,
    tile: 48,
  },
} as const;

export type Sizes = typeof sizes;

export const TAB_BAR_HEIGHT = 72;

export function getTabBarContentPaddingBottom(insetsBottom: number): number {
  return TAB_BAR_HEIGHT + 8 + Math.max(insetsBottom, 12) + 16;
}
