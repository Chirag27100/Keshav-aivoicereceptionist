/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0D0D0D',
        'bg-card': '#141414',
        'bg-surface': '#1A1A1A',
        'accent-gold': '#C9A84C',
        'accent-skin': '#E8C4A0',
        'text-primary': '#F5F0E8',
        'text-muted': '#8A8A8A',
        'border-custom': '#2A2A2A',
        'success': '#4CAF50',
        'error': '#E57373',
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      keyframes: {
        pulse_ring: {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '50%': { transform: 'scale(1.4)', opacity: '0.2' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        wave_dot: {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%': { transform: 'scaleY(1)' },
        },
        fade_in_up: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        pulse_ring: 'pulse_ring 1.5s ease-out infinite',
        wave_dot: 'wave_dot 1.2s ease-in-out infinite',
        fade_in_up: 'fade_in_up 0.4s ease-out forwards',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
