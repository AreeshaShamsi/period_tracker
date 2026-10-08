export const radius = {
  none: 0,
  small: 8,
  medium: 12,
  large: 16,
  button: 20,
  input: 14,
  checkbox: 6,
  card: 20,
  chip: 999,
  tile: 16,
  calendarCard: 14,
  bigInput: 12,
  pill: 999,
} as const;

export type Radius = keyof typeof radius;
