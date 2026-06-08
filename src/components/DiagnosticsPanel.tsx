import React, { useState, useEffect, useCallback } from 'react';
import { Terminal, X, RefreshCw, Trash2, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

interface DiagEntry {
  ts: number;
  type: 'error' | 'warn' | 'info' | 'react_error' | 'build_error' | 'network';
  msg: string;
  stack?: string;
}

const SESSION_KEY = 'opx_diag';

/** Capture console errors/warnings into sessionStorage */
function installConsoleCapture() {
  if ((window as any).__opx_diag_installed) return;
  (window as any).__opx_diag_installed = true;

  const push = (type: DiagEntry['type'], args: unknown[]) => {
    try {
      const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ').slice(0, 600);
      const log: DiagEntry[] = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '[]');
      log.unshift({ ts: Date.now(), type, msg });
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(log.slice(0, 80)));
    } catch {}
  };

  const origError = console.error.bind(console);
  const origWarn  = console.warn.bind(console);

  console.error = (...args: unknown[]) => { push('error', args); origError(...args); };
  console.warn  = (...args: unknown[]) => { push('warn',  args); origWarn(...args); };

  window.addEventListener('error', (e) => {
    push('error', [`[Unhandled] ${e.message} @ ${e.filename}:${e.lineno}`]);
  });
  window.addEventListener('unhandledrejection', (e) => {
    push('error', [`[UnhandledPromise] ${e.reason}`]);
  });
}

installConsoleCapture();

// ─── Panel ──────────────────────────────────────────────────────────────────
export const DiagnosticsPanel: React.FC = () => {
  const [open, setOpen]       = useState(false);
  const [entries, setEntries] = useState<DiagEntry[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);

  const refresh = useCallback(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      setEntries(raw ? JSON.parse(raw) : []);
    } catch { setEntries([]); }
  }, []);

  useEffect(() => { if (open) refresh(); }, [open, refresh]);
  // Auto-refresh every 3s when open
  useEffect(() => {
    if (!open) return;
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, [open, refresh]);

  const clear = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setEntries([]);
  };

  const errors  = entries.filter(e => e.type === 'error' || e.type === 'react_error');
  const hasErrors = errors.length > 0;

  const iconFor = (type: DiagEntry['type']) => {
    if (type === 'error' || type === 'react_error') return <XCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />;
    if (type === 'warn') return <AlertTriangle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />;
    return <Info className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />;
  };

  const colorFor = (type: DiagEntry['type']) => {
    if (type === 'error' || type === 'react_error') return 'text-red-300';
    if (type === 'warn') return 'text-amber-300';
    return 'text-slate-400';
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => { setOpen(o => !o); if (!open) refresh(); }}
        title="Preview Diagnostics"
        className="fixed bottom-5 left-5 z-50 flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all shadow-lg"
        style={{
          background: hasErrors ? 'rgba(239,68,68,0.15)' : 'rgba(17,24,39,0.90)',
          borderColor: hasErrors ? 'rgba(239,68,68,0.40)' : 'rgba(255,255,255,0.10)',
          color: hasErrors ? '#fca5a5' : '#94a3b8',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Terminal className="h-3.5 w-3.5" />
        Diagnostics
        {hasErrors && (
          <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {errors.length > 9 ? '9+' : errors.length}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-16 left-5 z-50 w-80 sm:w-96 rounded-2xl border shadow-glass-lg flex flex-col max-h-[60vh]"
          style={{
            background: 'rgba(10,13,20,0.97)',
            borderColor: 'rgba(255,255,255,0.10)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-semibold text-slate-200">Preview Diagnostics</span>
              {entries.length > 0 && (
                <span className="text-xs text-slate-500">{entries.length} events</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={refresh} title="Refresh" className="p-1 rounded hover:bg-white/8 text-slate-500 hover:text-slate-300 transition-colors">
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button onClick={clear} title="Clear" className="p-1 rounded hover:bg-white/8 text-slate-500 hover:text-red-400 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-white/8 text-slate-500 hover:text-slate-300 transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Build / environment status */}
          <div className="px-4 py-3 border-b border-white/6 flex-shrink-0 space-y-2">
            <StatusRow label="React App" ok={true} msg="Mounted successfully" />
            <StatusRow label="localStorage" ok={(() => { try { localStorage.setItem('_t','1'); localStorage.removeItem('_t'); return true; } catch { return false; } })()} msg={(() => { try { localStorage.setItem('_t','1'); localStorage.removeItem('_t'); return 'Available'; } catch (e: unknown) { return (e as Error).message; } })()} />
            <StatusRow label="sessionStorage" ok={(() => { try { sessionStorage.setItem('_t','1'); sessionStorage.removeItem('_t'); return true; } catch { return false; } })()} msg="Available" />
            <StatusRow label="No Backend / No Env Vars" ok={true} msg="100% client-side — none required" />
            <StatusRow label="Console Errors" ok={errors.length === 0} msg={errors.length === 0 ? 'None detected' : `${errors.length} error${errors.length > 1 ? 's' : ''} captured`} />
          </div>

          {/* Log entries */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
            {entries.length === 0 ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No errors or warnings captured.</p>
                <p className="text-xs text-slate-600 mt-0.5">Console errors will appear here in real time.</p>
              </div>
            ) : (
              entries.map((entry, i) => (
                <div key={i} className="rounded-lg border border-white/6 bg-white/2 overflow-hidden">
                  <button
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    className="w-full flex items-start gap-2 px-3 py-2 text-left hover:bg-white/3 transition-colors"
                  >
                    {iconFor(entry.type)}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-mono break-all leading-relaxed ${colorFor(entry.type)}`}>
                        {entry.msg.slice(0, 120)}{entry.msg.length > 120 ? '…' : ''}
                      </p>
                      <p className="text-xs text-slate-700 mt-0.5">
                        {new Date(entry.ts).toLocaleTimeString()} · {entry.type}
                      </p>
                    </div>
                    {expanded === i ? <ChevronUp className="h-3 w-3 text-slate-600 flex-shrink-0 mt-0.5" /> : <ChevronDown className="h-3 w-3 text-slate-600 flex-shrink-0 mt-0.5" />}
                  </button>
                  {expanded === i && entry.stack && (
                    <pre className="px-3 pb-2 text-xs text-slate-600 font-mono whitespace-pre-wrap break-all border-t border-white/4 pt-2 leading-relaxed">
                      {entry.stack}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-white/6 flex-shrink-0">
            <p className="text-xs text-slate-700 text-center">
              No backend · No Supabase · No env vars required · Pure client-side
            </p>
          </div>
        </div>
      )}
    </>
  );
};

const StatusRow: React.FC<{ label: string; ok: boolean; msg: string }> = ({ label, ok, msg }) => (
  <div className="flex items-center justify-between gap-2">
    <div className="flex items-center gap-1.5">
      {ok
        ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
        : <XCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />}
      <span className="text-xs text-slate-400">{label}</span>
    </div>
    <span className={`text-xs font-mono truncate max-w-[160px] text-right ${ok ? 'text-emerald-500' : 'text-red-400'}`}>{msg}</span>
  </div>
);
