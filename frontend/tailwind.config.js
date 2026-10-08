/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#FF5C8A",
          light: "#FFE6EE",
          soft: "#FFF1F5",
        },
        appText: {
          primary: "#1D1D1F",
          secondary: "#6E6E73",
          tertiary: "#8E8E93",
        },
        appBg: {
          primary: "#FFFFFF",
          secondary: "#F9F9FB",
          softPink: "#FFF1F5",
        },
        appBorder: "#E5E5EA",
        system: {
          red: "#FF3B30",
          green: "#34C759",
          orange: "#FF9500",
        },
      },
      borderRadius: {
        none: "0px",
        sm: "6px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        pill: "9999px",
      },
    },
  },
  plugins: [],
};