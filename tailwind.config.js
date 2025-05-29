module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fbff',
          100: '#d8f3ff',
          200: '#b8eaff',
          300: '#85deff',
          400: '#46c9ff',
          500: '#1aa6ff',
          600: '#0087ff',
          700: '#006be5',
          800: '#0058ba',
          900: '#064a93',
          950: '#062d5c',
        },
        accent: {
          50: '#fff6ed',
          100: '#ffead3',
          200: '#ffd1a5',
          300: '#ffb26d',
          400: '#ff8a36',
          500: '#ff6d10',
          600: '#f04a03',
          700: '#c73506',
          800: '#9c2a0c',
          900: '#7e250d',
          950: '#440f03',
        },
        success: {
          500: '#10b981',
          600: '#059669',
        },
        warning: {
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          500: '#ef4444',
          600: '#dc2626',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fire': 'fire 1.5s ease-in-out infinite alternate',
        'badge-pop': 'badge-pop 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        fire: {
          '0%': { transform: 'scale(1) rotate(-2deg)' },
          '50%': { transform: 'scale(1.1) rotate(2deg)' },
          '100%': { transform: 'scale(1) rotate(-2deg)' },
        },
        'badge-pop': {
          '0%': { transform: 'scale(0.9)', opacity: 0 },
          '70%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: 1 },
        }
      }
    },
  },
  plugins: [],
}