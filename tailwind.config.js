/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── OPX design tokens
        surface:  '#111827',
        elevated: '#1a2234',
        hover:    '#1e2a40',
        gold:     '#f0b429',
        'gold-dim':'#d97706',
      },
      boxShadow: {
        'gold-sm': '0 0 12px rgba(240,180,41,0.20)',
        'gold-md': '0 0 24px rgba(240,180,41,0.25), 0 0 48px rgba(240,180,41,0.10)',
        'glass':   '0 8px 32px rgba(0,0,0,0.40)',
        'glass-lg':'0 20px 60px rgba(0,0,0,0.60)',
      },
      backgroundImage: {
        'grad-gold':  'linear-gradient(135deg, #f0b429 0%, #d97706 100%)',
        'grad-navy':  'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
        'grad-blue':  'linear-gradient(135deg, #2563eb 0%, #6366f1 100%)',
        'grad-dark':  'linear-gradient(135deg, #0a0d14 0%, #111827 100%)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'Consolas', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-gold': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
}
