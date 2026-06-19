import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff0ed',
          100: '#ffded5',
          200: '#ffbcaa',
          300: '#ff8f75',
          400: '#FF6034',
          500: '#ff3d14',
          600: '#f0240a',
          700: '#c7180b',
          800: '#9e1611',
          900: '#7f1612',
        },
        ai: {
          gradientStart: '#FF6034',
          gradientEnd: '#8B5CF6',
          glow: 'rgba(139,92,246,0.15)',
        },
        apple: {
          bg: '#f5f5f7',
          card: '#ffffff',
          text: '#1d1d1f',
          secondary: '#86868b',
          border: '#d2d2d7',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        'apple': '0 2px 12px rgba(0,0,0,0.04)',
        'apple-md': '0 4px 24px rgba(0,0,0,0.06)',
        'apple-lg': '0 8px 40px rgba(0,0,0,0.08)',
        'ai-glow': '0 0 20px rgba(139,92,246,0.15), 0 4px 24px rgba(0,0,0,0.06)',
        'ai-glow-lg': '0 0 40px rgba(139,92,246,0.2), 0 8px 40px rgba(0,0,0,0.08)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(139,92,246,0.1)' },
          '50%': { boxShadow: '0 0 24px rgba(139,92,246,0.2)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'gradient-x': 'gradient-x 3s ease infinite',
      },
    },
  },
  plugins: [],
}
export default config
