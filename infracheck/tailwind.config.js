/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // 👈 CRÍTICO: Habilita dark mode con clase
  theme: { 
    extend: {} 
  },
  plugins: [],
};