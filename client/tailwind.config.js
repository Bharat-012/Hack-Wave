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
          50: '#FCFCF9',
          100: '#F8F9F5',
          200: '#F0F2EB',
          300: '#E2E6DA',
        },
        forest: {
          50: '#F1F7F4',
          100: '#DFECE5',
          200: '#C0D9CD',
          500: '#2A5A43',
          600: '#224B37',
          700: '#1B3B2B',
          800: '#142C20',
          900: '#0E1F16',
        },
        quest: {
          light: '#ECFCCB',
          DEFAULT: '#65A30D',
          hover: '#4D7C0F',
          dark: '#3F6212',
        },
        civic: {
          amber: '#D97706',
          emerald: '#059669',
          blue: '#2563EB',
          purple: '#7C3AED',
          rose: '#E11D48',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Noto Sans Devanagari', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(14, 31, 22, 0.08)',
        'glass-hover': '0 12px 40px 0 rgba(14, 31, 22, 0.14)',
        'glow-quest': '0 0 25px -5px rgba(101, 163, 13, 0.3)',
        'glow-forest': '0 0 25px -5px rgba(27, 59, 43, 0.25)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
