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
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />,
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    icon: <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />,
  },
  danger: {
    bg: 'bg-red-50',
    border: 'border-red-300',
    icon: <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />,
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    icon: <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />,
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
        {title && <p className="font-semibold text-sm mb-1">{title}</p>}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
};
