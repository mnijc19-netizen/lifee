/**
 * Lifee Unified Design Tokens (LIFEE_UI_UX_V1)
 * Standardized surfaces, typography, semantic status colors, and interactive controls.
 */

export const tokens = {
  surfaces: {
    page: 'bg-slate-950 text-slate-100',
    primaryCard: 'bg-slate-900 border border-slate-800/80 rounded-xl p-4 sm:p-5 shadow-sm',
    secondaryCard: 'bg-slate-900/60 border border-slate-800/60 rounded-lg p-3.5 sm:p-4',
    insetPanel: 'bg-slate-950/60 border border-slate-800/50 rounded-lg p-3 sm:p-3.5',
    warningPanel: 'bg-amber-950/20 border border-amber-800/40 rounded-lg p-3 text-amber-200',
    dangerPanel: 'bg-rose-950/20 border border-rose-800/40 rounded-lg p-3 text-rose-200',
    interactiveRow: 'flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/50 transition-colors',
  },
  typography: {
    titleHero: 'text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight',
    titleSection: 'text-lg sm:text-xl font-bold text-slate-100 tracking-tight',
    titleCard: 'text-base font-semibold text-slate-100',
    body: 'text-sm sm:text-base text-slate-300 leading-relaxed',
    bodySmall: 'text-xs sm:text-sm text-slate-400 leading-relaxed',
    caption: 'text-xs text-slate-400',
    meta: 'text-[11px] font-mono text-slate-500',
    label: 'text-xs font-medium text-slate-400 uppercase tracking-wider',
  },
  buttons: {
    primary: 'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-sm font-medium transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-800/90 hover:bg-slate-700 active:bg-slate-800 text-slate-200 text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer',
    outline: 'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-slate-300 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 cursor-pointer',
    ghost: 'inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 text-xs font-medium transition-colors cursor-pointer',
    danger: 'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-medium transition-colors cursor-pointer',
  },
  badges: {
    green: 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    amber: 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20',
    red: 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20',
    purple: 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20',
    neutral: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700/80',
  }
};
