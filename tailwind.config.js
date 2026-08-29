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
        brand: {
          green: {
            DEFAULT: '#6ab329',
            50: '#f4fbf0',
            100: '#e6f7de',
            200: '#cef0bf',
            300: '#aee496',
            400: '#8ad368',
            500: '#6ab329',
            600: '#53961d',
            700: '#41751b',
            800: '#365d1b',
            900: '#2d4e1a',
            950: '#152c0a',
          },
          teal: {
            DEFAULT: '#00a896',
            50: '#f0fdfa',
            100: '#ccfbf1',
            200: '#99f6e4',
            300: '#5eead4',
            400: '#2dd4bf',
            500: '#00a896',
            600: '#0d9488',
            700: '#0f766e',
            800: '#115e59',
            900: '#134e4a',
            950: '#042f2e',
          },
          dark: {
            DEFAULT: '#0f172a',
            surface: '#1e293b',
            card: '#182234',
            border: '#334155'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-green': '0 0 25px -5px rgba(106, 179, 41, 0.3)',
        'glow-teal': '0 0 25px -5px rgba(0, 168, 150, 0.3)',
      }
    },
  },
  plugins: [],
}
