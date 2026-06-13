/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          950: "#050505",
          900: "#0b0b0c",
          850: "#111113",
          800: "#171719",
          700: "#242428",
        },
        brand: {
          aqua: "#59f0d9",
          rose: "#ff6b9a",
          lime: "#b5f36d",
          amber: "#ffd166",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,.08), 0 24px 80px rgba(0,0,0,.45)",
        soft: "0 16px 50px rgba(0,0,0,.28)",
      },
    },
  },
  plugins: [],
};

