/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        court: {
          green: "#2d7a4c",
          dark: "#1e5233",
          kitchen: "#3b82f6",
          boundary: "#f8fafc",
          surface: "#10b981",
        },
        pickleball: {
          yellow: "#eab308",
          lime: "#84cc16",
        }
      }
    },
  },
  plugins: [],
}
