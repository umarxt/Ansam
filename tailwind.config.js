/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // هوية أنسام
        navy: {
          DEFAULT: "#12283F",
          50: "#eef2f7",
          100: "#d6e0ea",
          200: "#aac0d5",
          300: "#7699b5",
          400: "#4b6f92",
          500: "#2f4f70",
          600: "#213c58",
          700: "#182f47",
          800: "#12283F",
          900: "#0d1d2e",
        },
        brand: {
          DEFAULT: "#2E6DA6",
          light: "#3f82c0",
          dark: "#255a8a",
        },
        sky: {
          soft: "#D6E4F0",
        },
        slate: {
          brand: "#4B6076",
        },
        steel: "#8B97A6",
        cream: "#FAF7F1",
      },
      fontFamily: {
        sans: [
          "Clother Arabic",
          "SF Arabic",
          "Segoe UI",
          "IBM Plex Sans Arabic",
          "system-ui",
          "sans-serif",
        ],
        arabic: [
          "Clother Arabic",
          "SF Arabic",
          "Segoe UI",
          "IBM Plex Sans Arabic",
          "system-ui",
          "sans-serif",
        ],
      },
      fontSize: {
        // المقياس الطباعي — القسم 3 (القيَم للديسكتوب؛ الجوال عبر أصناف type-*)
        hero: ["48px", { lineHeight: "1.35" }],
        section: ["34px", { lineHeight: "1.4" }],
        "card-title": ["19px", { lineHeight: "1.5" }],
        body: ["16px", { lineHeight: "1.8" }],
        eyebrow: ["13px", { lineHeight: "1.5" }],
      },
      boxShadow: {
        soft: "0 4px 24px -8px rgba(18, 40, 63, 0.12)",
        card: "0 2px 16px -6px rgba(18, 40, 63, 0.10)",
        glow: "0 8px 40px -12px rgba(46, 109, 166, 0.35)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      backgroundImage: {
        "navy-gradient": "linear-gradient(135deg, #12283F 0%, #255a8a 100%)",
        "brand-gradient": "linear-gradient(135deg, #2E6DA6 0%, #4B6076 100%)",
      },
    },
  },
  plugins: [],
};
