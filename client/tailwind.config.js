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
        brandAccent: '#10b981', // green-500
        darkBg: '#0f172a',      // slate-900
        cardBg: '#1e293b',      // slate-800
      },
    },
  },
  plugins: [],
}
