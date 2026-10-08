export const animation = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  easing: {
    easeInOut: "ease-in-out",
    easeIn: "ease-in",
    easeOut: "ease-out",
    linear: "linear",
  },
} as const;

export type Animation = typeof animation;
