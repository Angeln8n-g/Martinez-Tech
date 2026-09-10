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
        nexablue: {
          DEFAULT: '#0072ff',
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#38a8f8',
          500: '#0072ff',
          600: '#0055eb',
          700: '#0042c7',
          800: '#0537a1',
          900: '#0a307f',
          950: '#071f54',
        },
        obsidian: {
          DEFAULT: '#06080e',
          50: '#141c2e',
          100: '#0f1726',
          200: '#0d131f',
          300: '#0b0f19',
          400: '#080c14',
          500: '#06080e',
          600: '#04060a',
          card: '#0a0e18',
          surface: '#0e1422',
          border: '#1a243b',
          rim: '#263554',
        },
        titanium: {
          DEFAULT: '#cbd5e1',
          light: '#f8fafc',
          silver: '#e2e8f0',
          steel: '#94a3b8',
          dark: '#475569',
          edge: '#334155'
        },
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
            DEFAULT: '#0072ff',
            50: '#f0f7ff',
            100: '#e0effe',
            200: '#bae0fd',
            300: '#7cc7fb',
            400: '#38a8f8',
            500: '#0072ff',
            600: '#0055eb',
            700: '#0042c7',
            800: '#0537a1',
            900: '#0a307f',
            950: '#071f54',
          },
          dark: {
            DEFAULT: '#06080e',
            surface: '#0e1422',
            card: '#0a0e18',
            border: '#1a243b'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-green': '0 0 25px -5px rgba(106, 179, 41, 0.3)',
        'glow-teal': '0 0 25px -5px rgba(0, 114, 255, 0.4)',
        'glow-nexablue': '0 0 35px -5px rgba(0, 114, 255, 0.5)',
        'glow-shield': '0 0 50px -10px rgba(0, 114, 255, 0.45)',
        'metal-bevel': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.15), 0 4px 20px rgba(0, 0, 0, 0.6)',
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        '2xs': '0 1px 1px 0 rgba(0, 0, 0, 0.03)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        slideUp: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }
    },
  },
  plugins: [],
}
