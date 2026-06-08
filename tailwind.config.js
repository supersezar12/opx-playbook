/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // ── White opacity variants (used in dark UI components) ──────────────────
    'bg-white/2','bg-white/3','bg-white/5','bg-white/6','bg-white/8','bg-white/10',
    'border-white/6','border-white/8','border-white/10','border-white/12',
    'border-white/15','border-white/16','border-white/20',
    'hover:bg-white/5','hover:bg-white/6','hover:bg-white/8','hover:bg-white/10',
    'hover:border-white/16','hover:border-white/20',
    // ── Amber/gold opacity variants ──────────────────────────────────────────
    'bg-amber-500/6','bg-amber-500/8','bg-amber-500/10','bg-amber-500/15',
    'bg-amber-500/20','bg-amber-500/30',
    'border-amber-500/20','border-amber-500/25','border-amber-500/30',
    'border-amber-500/40','border-amber-500/50','border-amber-500/60',
    'border-amber-400/40','border-amber-400/60',
    'focus:border-amber-500/50','focus:border-amber-500/60',
    'focus:ring-amber-500/15','focus:ring-amber-500/20',
    'text-amber-300','text-amber-400',
    // ── Blue opacity variants ────────────────────────────────────────────────
    'bg-blue-500/10','bg-blue-500/15',
    'border-blue-500/20','border-blue-500/25','border-blue-500/30',
    'border-blue-500/40',
    'shadow-blue-900/30',
    // ── Emerald opacity variants ─────────────────────────────────────────────
    'bg-emerald-500/8','bg-emerald-500/10','bg-emerald-500/15',
    'border-emerald-500/20','border-emerald-500/25','border-emerald-500/30',
    'border-emerald-500/40',
    'focus:ring-emerald-500/20',
    'shadow-emerald-900/30',
    // ── Red opacity variants ─────────────────────────────────────────────────
    'bg-red-500/8','bg-red-500/10','bg-red-500/15',
    'border-red-500/20','border-red-500/25','border-red-500/30',
    'border-red-500/40','border-red-500/50',
    'focus:ring-red-500/20',
    // ── Violet opacity variants ──────────────────────────────────────────────
    'bg-violet-500/8','bg-violet-500/10','bg-violet-500/15',
    'border-violet-500/20','border-violet-500/25','border-violet-500/30',
    'border-violet-500/40','border-violet-500/50',
    'focus-visible:ring-violet-400/60',
    // ── Purple opacity variants ──────────────────────────────────────────────
    'bg-purple-500/15','border-purple-500/25','border-purple-500/30',
    // ── Teal opacity variants ────────────────────────────────────────────────
    'bg-teal-500/15','border-teal-500/20','border-teal-500/25','border-teal-500/30',
    // ── Indigo opacity variants ──────────────────────────────────────────────
    'bg-indigo-500/15','border-indigo-500/20','border-indigo-500/25',
    // ── Slate opacity variants ───────────────────────────────────────────────
    'bg-slate-700/80','bg-slate-600/80','border-slate-600/50','border-slate-600/60',
    // ── Gray opacity variants ────────────────────────────────────────────────
    'bg-gray-800/60','bg-gray-800/80','bg-gray-900/80','bg-gray-950/80',
    // ── Shadow opacity variants ──────────────────────────────────────────────
    'shadow-amber-900/30','shadow-amber-500/20',
    // ── Focus visible variants ───────────────────────────────────────────────
    'focus-visible:ring-amber-400/60',
    'focus:ring-2',
    // ── Gradient stops ───────────────────────────────────────────────────────
    'from-amber-500/20','from-amber-500/15',
    'from-teal-500/20','from-purple-500/20',
    'from-emerald-500/15','from-blue-500/15',
    'from-violet-500/15','from-indigo-500/15',
  ],
  theme: {
    extend: {
      colors: {
        surface:   '#111827',
        elevated:  '#1a2234',
        hover:     '#1e2a40',
        gold:      '#f0b429',
        'gold-dim':'#d97706',
      },
      boxShadow: {
        'gold-sm': '0 0 12px rgba(240,180,41,0.20)',
        'gold-md': '0 0 24px rgba(240,180,41,0.25), 0 0 48px rgba(240,180,41,0.10)',
        'glass':   '0 8px 32px rgba(0,0,0,0.40)',
        'glass-lg':'0 20px 60px rgba(0,0,0,0.60)',
      },
      backgroundImage: {
        'grad-gold': 'linear-gradient(135deg, #f0b429 0%, #d97706 100%)',
        'grad-navy': 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
        'grad-blue': 'linear-gradient(135deg, #2563eb 0%, #6366f1 100%)',
        'grad-dark': 'linear-gradient(135deg, #0a0d14 0%, #111827 100%)',
      },
      fontFamily: {
        sans: ['-apple-system','BlinkMacSystemFont','Inter','Segoe UI','sans-serif'],
        mono: ['Fira Code','JetBrains Mono','Consolas','monospace'],
      },
      animation: {
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
        'spin-slow':  'spin 2s linear infinite',
      },
      keyframes: {
        'pulse-gold': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
    },
  },
  plugins: [],
}
