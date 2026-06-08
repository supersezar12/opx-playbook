import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all duration-150',
            'bg-gray-800/60 text-slate-100 placeholder-slate-500',
            'border-white/10 hover:border-white/20',
            'focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 focus:bg-gray-800/80',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            error && 'border-red-500/60 focus:ring-red-500/20 focus:border-red-500/60',
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
        {error && <p className="text-xs text-red-400 flex items-center gap-1">⚠ {error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
