import React from 'react';
import { AlertTriangle, RefreshCw, Terminal } from 'lucide-react';

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface Props {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    // Push into diagnostics log
    try {
      const log = JSON.parse(sessionStorage.getItem('opx_diag') || '[]');
      log.unshift({ ts: Date.now(), type: 'react_error', msg: error.message, stack: error.stack?.slice(0, 400) });
      sessionStorage.setItem('opx_diag', JSON.stringify(log.slice(0, 50)));
    } catch {}
  }

  handleReset() {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0a0d14' }}>
        <div className="max-w-lg w-full rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 mb-5">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-100 mb-2">Application Error</h1>
          <p className="text-slate-400 text-sm mb-4">
            A React render error occurred. This is usually a temporary issue.
          </p>

          {this.state.error && (
            <div className="text-left bg-black/40 rounded-xl border border-white/8 p-4 mb-5">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="h-4 w-4 text-red-400" />
                <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">Error Details</span>
              </div>
              <p className="text-xs text-red-300 font-mono break-all leading-relaxed">
                {this.state.error.message}
              </p>
              {this.state.errorInfo?.componentStack && (
                <pre className="text-xs text-slate-600 font-mono mt-3 overflow-auto max-h-32 leading-relaxed whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack.trim().slice(0, 500)}
                </pre>
              )}
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => this.handleReset()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-semibold text-sm hover:from-amber-400 hover:to-yellow-300 transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
            <button
              onClick={() => { localStorage.clear(); sessionStorage.clear(); window.location.reload(); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 text-sm hover:bg-white/10 transition-all"
            >
              Clear & Reload
            </button>
          </div>
        </div>
      </div>
    );
  }
}
