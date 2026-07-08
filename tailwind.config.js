/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: {
          bg: "#0F1115",
          panel: "#161A20",
          border: "#242A33",
        },
        brand: {
          50: "#EEF4FF",
          500: "#4F7CFF",
          600: "#3D63E0",
          700: "#2E4BB8",
        },
      },
      fontFamily: {
        display: ["'Sora'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
