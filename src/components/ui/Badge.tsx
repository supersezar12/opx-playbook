import React from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'gold' | 'violet';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:  'bg-slate-700/80 text-slate-300 border border-slate-600/60',
  success:  'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  warning:  'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  danger:   'bg-red-500/15 text-red-400 border border-red-500/30',
  info:     'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  outline:  'bg-transparent text-slate-400 border border-white/15',
  gold:     'bg-amber-500/20 text-amber-300 border border-amber-500/40',
  violet:   'bg-violet-500/15 text-violet-400 border border-violet-500/30',
};

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', children, ...props }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
      variantClasses[variant],
      className
    )}
    {...props}
  >
    {children}
  </span>
);
