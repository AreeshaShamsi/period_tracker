const baseColors = {
  primary: '#FF5C8A',
  primarySoft: '#FFF1F5',
  textPrimary: '#1D1D1F',
  textSecondary: '#6E6E73',
  separator: '#E5E5EA',
  appleBlack: '#000000',
  danger: '#FF3B30',
  success: '#34C759',
  inputBg: '#F5F5F7',
  inputIcon: '#8E8E93',
  inputPlaceholder: '#AEAEB2',
  background: '#FFFFFF',
  white: '#FFFFFF',

  // Progress, calendar & alpha additions
  track: '#EDEDF0',
  circleBorder: '#D1D1D6',
  circleCheck: '#C7C7CC',
  whiteAlpha20: 'rgba(255, 255, 255, 0.2)',
  whiteAlpha30: 'rgba(255, 255, 255, 0.3)',
  whiteAlpha85: 'rgba(255, 255, 255, 0.85)',

  // Legacy key aliases for backward compatibility
  primaryDark: '#D81B60',
  textMuted: '#AEAEB2',
  black: '#000000',

  brand: {
    primary: '#FF5C8A',
    light: '#FFF1F5',
    soft: '#FFF1F5',
    veryLight: '#FFF7F9',
  },

  text: {
    primary: '#1D1D1F',
    secondary: '#6E6E73',
    tertiary: '#8E8E93',
    placeholder: '#AEAEB2',
    inverse: '#FFFFFF',
  },

  system: {
    red: '#FF3B30',
    green: '#34C759',
    orange: '#FF9500',
  },

  button: {
    apple: '#000000',
    google: '#FFFFFF',
    primary: '#FF5C8A',
  },

  semantic: {
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#007AFF',
    disabled: '#AEAEB2',
    selected: '#FF5C8A',
  },
};

const borderObj = Object.assign('#E5E5EA', {
  primary: '#E5E5EA',
  subtle: '#F2F2F7',
});

const backgroundObj = Object.assign('#FFFFFF', {
  primary: '#FFFFFF',
  secondary: '#F9F9FB',
  input: '#F5F5F7',
  softPink: '#FFF1F5',
  card: '#FFFFFF',
});

export const colors = {
  ...baseColors,
  border: borderObj,
  background: backgroundObj,
};

export type Colors = typeof colors;
