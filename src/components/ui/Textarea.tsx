import React from 'react';
import { cn } from '../../lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all duration-150 resize-y',
            'bg-gray-800/60 text-slate-100 placeholder-slate-500',
            'border-white/10 hover:border-white/20',
            'focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 focus:bg-gray-800/80',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            error && 'border-red-500/60 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
        {error && <p className="text-xs text-red-400">⚠ {error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
