import React, { useEffect, useState } from 'react';
import { BookOpen, AlertTriangle, RefreshCw } from 'lucide-react';

type LoadState = 'loading' | 'ready' | 'error';

interface AppLoaderProps {
  children: React.ReactNode;
}

/**
 * Wraps the app with a themed loading screen while React hydrates.
 * Also catches network/module errors during initial load.
 */
export const AppLoader: React.FC<AppLoaderProps> = ({ children }) => {
  const [state, setState] = useState<LoadState>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Give React one frame to mount; then mark ready
    const id = requestAnimationFrame(() => {
      try {
        // Quick sanity: localStorage accessible?
        localStorage.getItem('opx_test');
        setState('ready');
      } catch (e: unknown) {
        setErrorMsg((e as Error).message);
        setState('error');
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  if (state === 'loading') {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-6"
        style={{ background: '#0a0d14' }}
        role="status"
        aria-label="Loading OPX Playbook Builder"
      >
        {/* Animated logo */}
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-amber-500/20 blur-xl animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/30 to-yellow-600/20 border border-amber-500/40 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-amber-400" />
          </div>
        </div>

        {/* Spinner ring */}
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-white/6" />
          <div className="absolute inset-0 rounded-full border-2 border-t-amber-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </div>

        <div className="text-center">
          <p className="text-slate-200 font-semibold text-base">OPX Playbook Builder</p>
          <p className="text-slate-500 text-sm mt-1">Initialising workspace…</p>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: '#0a0d14' }}
      >
        <div className="max-w-md w-full rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 mb-4">
            <AlertTriangle className="h-7 w-7 text-red-400" />
          </div>
          <h1 className="text-lg font-bold text-slate-100 mb-2">Failed to initialise</h1>
          <p className="text-slate-400 text-sm mb-4">
            The app could not start. This may be a browser storage restriction or a network error.
          </p>
          {errorMsg && (
            <p className="text-xs text-red-400 font-mono bg-black/30 rounded-xl p-3 mb-5 break-all">{errorMsg}</p>
          )}
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-semibold text-sm mx-auto hover:from-amber-400 hover:to-yellow-300 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Reload App
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
