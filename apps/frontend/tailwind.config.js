/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dbe6fe',
          200: '#bfd4fe',
          300: '#93b6fd',
          400: '#6090fa',
          500: '#3b6df5',
          600: '#2851e0',
          700: '#213fb8',
          800: '#1f3592',
          900: '#1e2f74',
        },
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        elevate: '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)',
        'elevate-lg': '0 4px 8px -2px rgb(0 0 0 / 0.06), 0 12px 24px -4px rgb(0 0 0 / 0.08)',
        'elevate-dark': '0 1px 2px 0 rgb(0 0 0 / 0.3), 0 1px 3px 0 rgb(0 0 0 / 0.4)',
        'elevate-lg-dark': '0 4px 8px -2px rgb(0 0 0 / 0.3), 0 12px 24px -4px rgb(0 0 0 / 0.4)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'scale-in': { from: { opacity: 0, transform: 'scale(0.96) translateY(4px)' }, to: { opacity: 1, transform: 'scale(1) translateY(0)' } },
        'slide-up': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        'slide-in-right': { from: { opacity: 0, transform: 'translateX(16px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.15s ease-out',
        'scale-in': 'scale-in 0.16s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slide-up 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-right': 'slide-in-right 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
