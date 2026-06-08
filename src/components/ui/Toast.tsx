/**
 * Lightweight Toast / notification system.
 * Usage: import { useToast } from './Toast'
 *        const { toasts, toast } = useToast();
 *        toast.success('Saved!');
 *        <ToastContainer toasts={toasts} onDismiss={dismiss} />
 */
import React, { useState, useCallback, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
}

interface ToastApi {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

let _uid = 0;
const uid = () => `toast_${++_uid}`;

export function useToast(durationMs = 4000): {
  toasts: ToastItem[];
  toast: ToastApi;
  dismiss: (id: string) => void;
} {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const add = useCallback((variant: ToastVariant, title: string, message?: string) => {
    const id = uid();
    setToasts(t => [...t, { id, variant, title, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), durationMs);
  }, [durationMs]);

  const dismiss = useCallback((id: string) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const toast: ToastApi = {
    success: (title, msg) => add('success', title, msg),
    error: (title, msg) => add('error', title, msg),
    warning: (title, msg) => add('warning', title, msg),
    info: (title, msg) => add('info', title, msg),
  };

  return { toasts, toast, dismiss };
}

// ─── Variant config ───────────────────────────────────────────────────────────
const cfg: Record<ToastVariant, { bg: string; border: string; icon: React.ReactNode; iconColor: string }> = {
  success: { bg: 'bg-emerald-50', border: 'border-emerald-300', icon: <CheckCircle2 className="h-5 w-5" />, iconColor: 'text-emerald-600' },
  error:   { bg: 'bg-red-50',     border: 'border-red-300',     icon: <XCircle className="h-5 w-5" />,      iconColor: 'text-red-600'     },
  warning: { bg: 'bg-amber-50',   border: 'border-amber-300',   icon: <AlertTriangle className="h-5 w-5" />, iconColor: 'text-amber-600'   },
  info:    { bg: 'bg-blue-50',    border: 'border-blue-300',    icon: <Info className="h-5 w-5" />,          iconColor: 'text-blue-600'    },
};

// ─── Individual toast ─────────────────────────────────────────────────────────
const Toast: React.FC<{ item: ToastItem; onDismiss: () => void }> = ({ item, onDismiss }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);
  const c = cfg[item.variant];
  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm w-full transition-all duration-300',
        c.bg, c.border,
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      )}
      role="alert"
    >
      <span className={cn('flex-shrink-0 mt-0.5', c.iconColor)}>{c.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{item.title}</p>
        {item.message && <p className="text-xs text-gray-600 mt-0.5">{item.message}</p>}
      </div>
      <button onClick={onDismiss} className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors mt-0.5">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

// ─── Container (mount at root) ────────────────────────────────────────────────
export const ToastContainer: React.FC<{ toasts: ToastItem[]; onDismiss: (id: string) => void }> = ({
  toasts, onDismiss,
}) => (
  <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 items-end pointer-events-none">
    {toasts.map(t => (
      <div key={t.id} className="pointer-events-auto">
        <Toast item={t} onDismiss={() => onDismiss(t.id)} />
      </div>
    ))}
  </div>
);
