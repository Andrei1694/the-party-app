/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core SENS palette
        "cusens-primary": "#A2DA5A",
        "cusens-primary-hover": "#86E30F",
        "cusens-accent": "#FED502",
        "cusens-bg": "#F8FFE9",
        "cusens-surface": "#FFFFFF",
        "cusens-surface-muted": "#E3EAD3",
        "cusens-border": "#E3EAD3",
        "cusens-text-primary": "#32443E",
        "cusens-text-secondary": "#456F0F",
        "cusens-dark": "#32443E",
        "cusens-dark-muted": "#293B35",
        "cusens-dark-hover": "#275847",
        // Backward-compatible aliases used in existing pages/components
        "cusens-blue": "#A2DA5A",
        "cusens-green": "#A2DA5A",
        "cusens-green-light": "#E3EAD3",
      },
      fontFamily: {
        sans: ['"Open Sans"', "Arial", "sans-serif"],
        heading: ["Montserrat", '"Open Sans"', "sans-serif"],
        display: ["Montserrat", '"Open Sans"', "sans-serif"],
      },
      borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
    },
  },
  plugins: [],
}
