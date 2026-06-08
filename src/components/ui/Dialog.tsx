import React, { useEffect } from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const maxWidthClasses = {
  sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', '2xl': 'max-w-2xl',
};

export const Dialog: React.FC<DialogProps> = ({
  open, onClose, title, description, children, maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => { document.removeEventListener('keydown', handleKey); document.body.style.overflow = ''; };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={cn(
          'relative rounded-2xl w-full flex flex-col max-h-[90vh]',
          'bg-gray-900 border border-white/12 shadow-glass-lg',
          maxWidthClasses[maxWidth]
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent rounded-full" />

        {(title || description) && (
          <div className="flex items-start justify-between px-6 py-5 border-b border-white/8 flex-shrink-0">
            <div>
              {title && <h2 className="text-base font-semibold text-slate-100">{title}</h2>}
              {description && <p className="text-sm text-slate-400 mt-0.5">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-1.5 rounded-lg hover:bg-white/8 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
};
