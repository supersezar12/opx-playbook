import React from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

type AlertVariant = 'success' | 'warning' | 'danger' | 'info';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
}

const variantConfig: Record<AlertVariant, { bg: string; border: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />,
  },
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    icon: <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />,
  },
  danger: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: <XCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />,
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />,
  },
};

export const Alert: React.FC<AlertProps> = ({ className, variant = 'info', title, children, ...props }) => {
  const cfg = variantConfig[variant];
  return (
    <div
      className={cn('flex gap-3 p-4 rounded-xl border', cfg.bg, cfg.border, className)}
      role="alert"
      {...props}
    >
      {cfg.icon}
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold text-sm text-slate-100 mb-1">{title}</p>}
        <div className="text-sm text-slate-300">{children}</div>
      </div>
    </div>
  );
};
