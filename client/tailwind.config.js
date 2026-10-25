/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFDFC',
          100: '#FBFBF9',
          200: '#F5F5F0',
          300: '#ECECE5',
        },
        forest: {
          50: '#F0F7F3',
          100: '#DFEFE7',
          500: '#2A5A43',
          700: '#1B3B2B',
          800: '#142C20',
          900: '#0E1F16',
        },
        quest: {
          DEFAULT: '#65A30D',
          hover: '#4D7C0F',
          light: '#ECFCCB',
        },
        amber: {
          DEFAULT: '#D97706',
          light: '#FEF3C7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Noto Sans Devanagari', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
