/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'light-bg': '#f8fafc',
        'light-panel': '#ffffff',
        'light-text': '#334155',
        'light-border': '#e2e8f0',
        'light-accent': '#0ea5e9',
        'brand-purple': '#8b5cf6',
        'brand-purple-light': '#a78bfa',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in-bottom': 'slideInBottom 0.5s ease-in-out',
        'dot-pulse': 'dotPulse 1.4s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInBottom: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        dotPulse: {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1.0)' },
        },
      },
    }
  },
  plugins: [],
}