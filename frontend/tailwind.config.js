/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#FF5C8A",
        "primary-soft": "#FFF1F5",
        "text-primary": "#1D1D1F",
        "text-secondary": "#6E6E73",
        separator: "#E5E5EA",
        "apple-black": "#000000",
      },
      borderRadius: {
        button: "20px",
      },
    },
  },
  plugins: [],
};