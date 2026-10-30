/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './data/**/*.{js,jsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#05070e',
        surface: {
          50: '#0b0f1c',
          100: '#10162a',
          200: '#161f3a',
          300: '#1f2b4e',
          400: '#2b3b68',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.08)',
          glow: 'rgba(6, 182, 212, 0.25)',
        },
        primary: {
          DEFAULT: '#06b6d4', // Electric Cyan
          hover: '#0891b2',
          glow: 'rgba(6, 182, 212, 0.15)',
        },
        secondary: {
          DEFAULT: '#10b981', // Bio Emerald
          hover: '#059669',
          glow: 'rgba(16, 185, 129, 0.15)',
        },
        neural: {
          DEFAULT: '#8b5cf6', // Neural Violet
          hover: '#7c3aed',
          glow: 'rgba(139, 92, 246, 0.15)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-mono)', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'grid-flow': 'gridFlow 20s linear infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        gridFlow: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(40px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'tech-grid': 'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'tech-grid': '32px 32px',
      },
    },
  },
  plugins: [],
};
