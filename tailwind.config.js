/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        handwriting: ['"Caveat"', 'cursive']
      },
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          navy: '#0f172a'
        },
        accent: {
          orange: '#f97316',
          amber: '#f59e0b',
          yellow: '#fbbf24',
          teal: '#0d9488',
          purple: '#8b5cf6',
          pink: '#fb7185'
        }
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2rem'
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(37, 99, 235, 0.06)',
        'card-hover': '0 12px 28px -4px rgba(37, 99, 235, 0.12)',
        glow: '0 0 25px rgba(37, 99, 235, 0.25)'
      },
      animation: {
        'float-slow': 'float 4s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.02)' }
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' }
        }
      }
    }
  },
  plugins: []
}
