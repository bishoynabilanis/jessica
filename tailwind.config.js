/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#05070f',
          900: '#080c19',
          850: '#0c1122',
          800: '#11172c',
          700: '#1a2340',
          600: '#263258',
        },
        aurora: {
          50: '#effefb',
          100: '#c9fff4',
          200: '#93ffe9',
          300: '#54f7db',
          400: '#21e6c9',
          500: '#08c9b1',
          600: '#03a190',
          700: '#078175',
          800: '#0a665f',
          900: '#0d554f',
        },
        violet: {
          neon: '#8b5cf6',
          glow: '#a78bfa',
        },
        sun: '#ffd166',
        coral: '#ff7a8a',
        sky: '#5cc8ff',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans Variable"', 'Cairo', 'system-ui', 'sans-serif'],
        arabic: ['Cairo', '"Plus Jakarta Sans Variable"', 'sans-serif'],
        dyslexic: ['"Atkinson Hyperlegible"', 'Cairo', 'sans-serif'],
        display: ['"Plus Jakarta Sans Variable"', 'Cairo', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -12px rgba(33, 230, 201, 0.45)',
        'glow-violet': '0 0 50px -14px rgba(139, 92, 246, 0.6)',
        card: '0 18px 50px -30px rgba(0, 0, 0, 0.9)',
      },
      backgroundImage: {
        'aurora-radial':
          'radial-gradient(1200px 600px at 15% -10%, rgba(139,92,246,.22), transparent 60%), radial-gradient(900px 500px at 100% 0%, rgba(33,230,201,.16), transparent 55%), radial-gradient(800px 600px at 50% 120%, rgba(92,200,255,.1), transparent 60%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pop: {
          '0%': { transform: 'scale(.85)', opacity: '0' },
          '70%': { transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        wiggle: {
          '0%,100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(33,230,201,.35)' },
          '100%': { boxShadow: '0 0 0 18px rgba(33,230,201,0)' },
        },
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        pop: 'pop .35s cubic-bezier(.22,1,.36,1)',
        wiggle: 'wiggle 1.2s ease-in-out infinite',
        'slide-up': 'slide-up .45s cubic-bezier(.22,1,.36,1) both',
        pulseRing: 'pulseRing 1.8s ease-out infinite',
      },
    },
  },
  plugins: [],
}
