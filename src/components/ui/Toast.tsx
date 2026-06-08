import React, { useState, useCallback, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';
export interface ToastItem { id: string; variant: ToastVariant; title: string; message?: string; }
interface ToastApi {
  success: (title: string, message?: string) => void;
  error:   (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info:    (title: string, message?: string) => void;
}

let _uid = 0;
const uid = () => `toast_${++_uid}`;

export function useToast(durationMs = 4000): { toasts: ToastItem[]; toast: ToastApi; dismiss: (id: string) => void } {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const add = useCallback((variant: ToastVariant, title: string, message?: string) => {
    const id = uid();
    setToasts(t => [...t, { id, variant, title, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), durationMs);
  }, [durationMs]);
  const dismiss = useCallback((id: string) => setToasts(t => t.filter(x => x.id !== id)), []);
  const toast: ToastApi = {
    success: (t, m) => add('success', t, m),
    error:   (t, m) => add('error', t, m),
    warning: (t, m) => add('warning', t, m),
    info:    (t, m) => add('info', t, m),
  };
  return { toasts, toast, dismiss };
}

const cfg: Record<ToastVariant, { bg: string; border: string; icon: React.ReactNode; dot: string }> = {
  success: { bg: 'bg-gray-900', border: 'border-emerald-500/40', icon: <CheckCircle2 className="h-4 w-4" />, dot: 'bg-emerald-400' },
  error:   { bg: 'bg-gray-900', border: 'border-red-500/40',     icon: <XCircle className="h-4 w-4" />,      dot: 'bg-red-400'     },
  warning: { bg: 'bg-gray-900', border: 'border-amber-500/40',   icon: <AlertTriangle className="h-4 w-4" />, dot: 'bg-amber-400'   },
  info:    { bg: 'bg-gray-900', border: 'border-blue-500/40',    icon: <Info className="h-4 w-4" />,          dot: 'bg-blue-400'    },
};

const iconColor: Record<ToastVariant, string> = {
  success: 'text-emerald-400', error: 'text-red-400', warning: 'text-amber-400', info: 'text-blue-400',
};

const Toast: React.FC<{ item: ToastItem; onDismiss: () => void }> = ({ item, onDismiss }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);
  const c = cfg[item.variant];
  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-glass max-w-sm w-full transition-all duration-300',
        c.bg, c.border,
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      )}
      role="alert"
    >
      <span className={cn('flex-shrink-0 mt-0.5', iconColor[item.variant])}>{c.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-100">{item.title}</p>
        {item.message && <p className="text-xs text-slate-400 mt-0.5">{item.message}</p>}
      </div>
      <button onClick={onDismiss} className="flex-shrink-0 text-slate-600 hover:text-slate-300 transition-colors mt-0.5">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: ToastItem[]; onDismiss: (id: string) => void }> = ({ toasts, onDismiss }) => (
  <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 items-end pointer-events-none">
    {toasts.map(t => (
      <div key={t.id} className="pointer-events-auto">
        <Toast item={t} onDismiss={() => onDismiss(t.id)} />
      </div>
    ))}
  </div>
);
