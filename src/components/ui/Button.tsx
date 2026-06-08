import React from 'react';
import { cn } from '../../lib/utils';

type Variant = 'default' | 'gold' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'success';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  default:     'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border border-blue-500/30 shadow-lg shadow-blue-900/30',
  gold:        'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-gray-900 font-semibold border border-amber-400/40 shadow-lg shadow-amber-900/30',
  outline:     'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:border-white/20',
  ghost:       'bg-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent',
  destructive: 'bg-red-600/90 hover:bg-red-500 text-white border border-red-500/30',
  secondary:   'bg-slate-700/80 hover:bg-slate-600/80 text-slate-200 border border-slate-600/50',
  success:     'bg-emerald-600/90 hover:bg-emerald-500 text-white border border-emerald-500/30 shadow-lg shadow-emerald-900/30',
};

const sizeClasses: Record<Size, string> = {
  sm:   'px-3 py-1.5 text-xs rounded-lg h-7',
  md:   'px-4 py-2 text-sm rounded-xl h-9',
  lg:   'px-6 py-3 text-sm rounded-xl h-11',
  icon: 'p-2 rounded-xl h-9 w-9',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </button>
  )
);
Button.displayName = 'Button';
