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
        primary: '#2c3e50',
        secondary: '#3498db',
        background: '#f5f6fa',
        error: '#e74c3c',
        success: '#2ecc71',
        text: '#2c3e50',
      },
    },
  },
  plugins: [],
}
