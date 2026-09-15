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
        handwriting: ['"Caveat"', 'cursive'],
        'headline-lg': ['"Plus Jakarta Sans"', 'sans-serif'],
        'headline-md': ['"Plus Jakarta Sans"', 'sans-serif'],
        'title-md': ['"Plus Jakarta Sans"', 'sans-serif'],
        'body-lg': ['"Plus Jakarta Sans"', 'sans-serif'],
        'body-md': ['"Plus Jakarta Sans"', 'sans-serif'],
        'body-sm': ['"Plus Jakarta Sans"', 'sans-serif'],
        'label-md': ['"Plus Jakarta Sans"', 'sans-serif'],
        'label-sm': ['"Plus Jakarta Sans"', 'sans-serif'],
        caption: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif']
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
        },
        surface: '#f8f9ff',
        background: '#f8f9ff',
        'surface-white': '#ffffff',
        'bg-canvas': '#f8fafc',
        'surface-container': '#e5eeff',
        'surface-container-low': '#eff4ff',
        'surface-container-high': '#dce9ff',
        'surface-variant': '#d3e4fe',
        'on-surface': '#0b1c30',
        'on-surface-variant': '#434655',
        outline: '#737686',
        'outline-variant': '#c3c6d7',
        primary: '#004ac6',
        'primary-container': '#2563eb',
        'deep-blue': '#1e3a8a',
        'pale-blue': '#eff6ff',
        'soft-blue': '#dbeafe',
        'soft-orange': '#fef3c7',
        'bright-orange': '#f97316',
        'success-emerald': '#10b981',
        'success-soft': '#d1fae5',
        'danger-rose': '#ef4444',
        'danger-soft': '#fee2e2',
        'accent-purple': '#8b5cf6',
        'accent-purple-soft': '#ede9fe',
        'secondary-fixed': '#ffddb8',
        'secondary-fixed-dim': '#ffb95f',
        'on-secondary-container': '#684000'
      },
      spacing: {
        'sidebar-width': '260px',
        'topbar-height': '76px',
        'content-max-width': '1440px',
        'space-xxs': '4px',
        'space-xs': '8px',
        'space-sm': '12px',
        'space-md': '16px',
        'space-lg': '20px',
        'space-xl': '24px',
        'space-2xl': '32px',
        'space-3xl': '40px',
        'space-4xl': '48px',
        'space-5xl': '64px',
        'gutter-grid': '20px',
        'gutter-panel': '24px'
      },
      fontSize: {
        display: ['40px', { lineHeight: '48px', letterSpacing: '-0.02em', fontWeight: '800' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '32px', letterSpacing: '-0.015em', fontWeight: '700' }],
        'title-md': ['18px', { lineHeight: '24px', fontWeight: '700' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '500' }],
        'body-md': ['14px', { lineHeight: '22px', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '700' }],
        'label-sm': ['12px', { lineHeight: '16px', fontWeight: '600' }],
        caption: ['11px', { lineHeight: '14px', letterSpacing: '0.02em', fontWeight: '600' }]
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
