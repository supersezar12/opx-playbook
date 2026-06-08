import React from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectOption { value: string; label: string; }

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  hint?: string;
}

export const Select: React.FC<SelectProps> = ({
  label, options, value, onChange,
  placeholder = 'Select an option...', className, error, hint,
}) => {
  const id = label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={e => onChange(e.target.value)}
          className={cn(
            'w-full px-3.5 py-2.5 text-sm rounded-xl border appearance-none transition-all duration-150 cursor-pointer',
            'bg-gray-800/60 text-slate-100',
            'border-white/10 hover:border-white/20',
            'focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20',
            !value && 'text-slate-500',
            error && 'border-red-500/60',
            className
          )}
        >
          <option value="" disabled className="bg-gray-900 text-slate-400">{placeholder}</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-gray-900 text-slate-100">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
      </div>
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-400">⚠ {error}</p>}
    </div>
  );
};
