/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#131313",
        surface: "#131313",
        "surface-container": "#1f1f1f",
        "surface-container-high": "#2a2a2a",
        "surface-container-highest": "#353535",
        "surface-container-low": "#1b1b1b",
        "surface-container-lowest": "#0e0e0e",
        "on-background": "#e2e2e2",
        "on-surface": "#e2e2e2",
        "on-surface-variant": "#baccb0",
        primary: "#efffe3",
        "primary-container": "#39ff14",
        "on-primary": "#053900",
        "on-primary-container": "#107100",
        outline: "#85967c",
        "outline-variant": "#3c4b35",
        error: "#ffb4ab",
        "error-container": "#93000a",
        "on-error": "#690005",
        "on-error-container": "#ffdad6",
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "9999px"
      },
      spacing: {
        unit: "4px",
        "container-max": "1280px",
        "margin-desktop": "64px",
        "margin-mobile": "16px",
        gutter: "24px"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        neon: "0 0 15px rgba(57, 255, 20, 0.4)",
        "neon-hover": "0 0 25px rgba(57, 255, 20, 0.6)",
      }
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/container-queries"),
  ],
}
