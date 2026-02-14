/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "cusens-primary": "#0D47A1", // Trust Blue
        "cusens-primary-hover": "#0A367A", // Slightly darker for hover
        "cusens-bg": "#FAFAFA",
        "cusens-surface": "#FFFFFF",
        "cusens-text-secondary": "#616161",
        "cusens-border": "#E0E0E0",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
    },
  },
  plugins: [],
}
