import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GitBranch, GitCommit, RefreshCw, CheckCircle2, AlertTriangle,
  XCircle, Clock, ArrowDownCircle, RotateCcw, ChevronDown,
  ChevronUp, ExternalLink, Loader2, Wifi, WifiOff, Info,
} from 'lucide-react';
import {
  getDeployStatus, markDeployed, markRollback, setBuildState,
  initDeployRecord, CURRENT_COMMIT, REPO_OWNER, REPO_NAME, REPO_BRANCH,
} from '../lib/deployMonitor';
import type { DeployStatus, BuildState } from '../lib/deployMonitor';

const POLL_INTERVAL = 60_000; // 60 seconds

interface DeployMonitorProps {
  open: boolean;
  onClose: () => void;
}

// ── Shared colour map ──────────────────────────────────────────────────────
const STATE_CONFIG: Record<BuildState, {
  label: string; dot: string; bg: string; border: string; icon: React.ReactNode;
}> = {
  live: {
    label: 'Live', dot: '#10b981',
    bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)',
    icon: <CheckCircle2 size={14} style={{ color: '#10b981' }} />,
  },
  deploying: {
    label: 'Deploying…', dot: '#f0b429',
    bg: 'rgba(240,180,41,0.08)', border: 'rgba(240,180,41,0.25)',
    icon: <Loader2 size={14} style={{ color: '#f0b429', animation: 'spin 1s linear infinite' }} />,
  },
  failed: {
    label: 'Failed', dot: '#ef4444',
    bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)',
    icon: <XCircle size={14} style={{ color: '#ef4444' }} />,
  },
  unknown: {
    label: 'Unknown', dot: '#64748b',
    bg: 'rgba(100,116,139,0.08)', border: 'rgba(100,116,139,0.25)',
    icon: <Info size={14} style={{ color: '#64748b' }} />,
  },
};

// ── Tiny inline badge used in the header ──────────────────────────────────
export const DeployStatusBadge: React.FC<{
  state: BuildState; isAhead: boolean; aheadCount: number; onClick: () => void;
}> = ({ state, isAhead, aheadCount, onClick }) => {
  const cfg = STATE_CONFIG[state];
  return (
    <button
      onClick={onClick}
      title="Deploy Monitor"
      style={{
        display: 'flex', alignItems: 'center', gap: '0.35rem',
        padding: '0.2rem 0.65rem', borderRadius: '0.5rem',
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        cursor: 'pointer', fontSize: '0.68rem', fontWeight: 700,
        color: cfg.dot, transition: 'all 0.15s', position: 'relative',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0,
        ...(state === 'live' && !isAhead ? { animation: 'pulse-dot 2s ease-in-out infinite' } : {}),
      }} />
      {cfg.label}
      {isAhead && (
        <span style={{
          background: '#f0b429', color: '#0a0d14', borderRadius: 999,
          padding: '0.05rem 0.35rem', fontSize: '0.6rem', fontWeight: 900, marginLeft: 2,
        }}>
          {aheadCount} new
        </span>
      )}
      <style>{`
        @keyframes pulse-dot { 0%,100%{opacity:1}50%{opacity:0.4} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </button>
  );
};

// ── Main panel ─────────────────────────────────────────────────────────────
export const DeployMonitor: React.FC<DeployMonitorProps> = ({ open, onClose }) => {
  const [status,          setStatus]          = useState<DeployStatus | null>(null);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');
  const [showDiff,        setShowDiff]        = useState(true);
  const [deploying,       setDeploying]       = useState(false);
  const [rollingBack,     setRollingBack]     = useState(false);
  const [lastRefresh,     setLastRefresh]     = useState<Date | null>(null);
  const [autoDeployed,    setAutoDeployed]    = useState(false);
  const [online,          setOnline]          = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [confirmRollback, setConfirmRollback] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Online/offline detection
  useEffect(() => {
    const on  = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online',  on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const refresh = useCallback(async (silent = false) => {
    if (!online) return;
    if (!silent) setLoading(true);
    setError('');
    try {
      initDeployRecord();
      const s = await getDeployStatus();
      setStatus(s);
      setLastRefresh(new Date());

      // Auto-redeploy: if remote is ahead AND build is live, trigger deploy
      if (s.isAhead && s.buildState === 'live' && !autoDeployed) {
        handleDeploy(s, true);
      }
    } catch (e: unknown) {
      setError(`Could not reach GitHub API: ${(e as Error).message}`);
    } finally {
      if (!silent) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online, autoDeployed]);

  // Initial load + polling
  useEffect(() => {
    if (!open) return;
    refresh();
    pollRef.current = setInterval(() => refresh(true), POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [open, refresh]);

  const handleDeploy = async (s?: DeployStatus, auto = false) => {
    const target = s ?? status;
    if (!target) return;
    setDeploying(true);
    setBuildState('deploying');
    setStatus(prev => prev ? { ...prev, buildState: 'deploying' } : prev);
    try {
      // Simulate deployment pipeline (in a real CI environment this would
      // trigger a webhook; here we track the commit and update state)
      await new Promise(r => setTimeout(r, 1800));
      markDeployed(target.remoteCommit);
      if (auto) setAutoDeployed(true);
      const fresh = await getDeployStatus();
      setStatus(fresh);
      setLastRefresh(new Date());
    } catch (e: unknown) {
      setBuildState('failed');
      setStatus(prev => prev ? { ...prev, buildState: 'failed' } : prev);
      setError(`Deploy failed: ${(e as Error).message}`);
    } finally {
      setDeploying(false);
    }
  };

  const handleRollback = async () => {
    setRollingBack(true);
    setBuildState('deploying');
    setStatus(prev => prev ? { ...prev, buildState: 'deploying' } : prev);
    try {
      await new Promise(r => setTimeout(r, 1400));
      markRollback();
      const fresh = await getDeployStatus();
      setStatus(fresh);
      setConfirmRollback(false);
    } catch (e: unknown) {
      setBuildState('failed');
      setError(`Rollback failed: ${(e as Error).message}`);
    } finally {
      setRollingBack(false);
    }
  };

  if (!open) return null;

  const cfg = status ? STATE_CONFIG[status.buildState] : STATE_CONFIG.unknown;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
      padding: '4.5rem 1rem 1rem',
      pointerEvents: 'none',
    }}>
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', pointerEvents: 'all' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div style={{
        position: 'relative', pointerEvents: 'all',
        width: '100%', maxWidth: 440,
        maxHeight: 'calc(100vh - 5.5rem)',
        display: 'flex', flexDirection: 'column',
        borderRadius: '1rem',
        background: 'rgba(10,13,20,0.98)',
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
        overflow: 'hidden',
        animation: 'slideInRight 0.22s cubic-bezier(.4,0,.2,1)',
      }}>
        <style>{`
          @keyframes slideInRight { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
          @keyframes spin { to{transform:rotate(360deg)} }
        `}</style>

        {/* ── Header ── */}
        <div style={{
          padding: '1rem 1.25rem 0.85rem',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.02)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <GitBranch size={16} style={{ color: '#f0b429' }} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f1f5f9' }}>Deploy Monitor</span>
            <a
              href={`https://github.com/${REPO_OWNER}/${REPO_NAME}/tree/${REPO_BRANCH}`}
              target="_blank" rel="noreferrer"
              style={{ fontSize: '0.68rem', color: '#475569', display: 'flex', alignItems: 'center', gap: 2 }}
            >
              {REPO_OWNER}/{REPO_NAME}
              <ExternalLink size={9} />
            </a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Online indicator */}
            {online
              ? <Wifi size={12} style={{ color: '#10b981' }} />
              : <WifiOff size={12} style={{ color: '#ef4444' }} />}
            <button
              onClick={() => refresh()}
              disabled={loading}
              title="Refresh"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}
            >
              <RefreshCw size={11} style={{ ...(loading ? { animation: 'spin 1s linear infinite' } : {}), color: '#94a3b8' }} />
              {loading ? 'Checking…' : 'Refresh'}
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex' }}>
              <XCircle size={16} />
            </button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '0.65rem', padding: '0.6rem 0.85rem', fontSize: '0.75rem', color: '#fca5a5', display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
              <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
              {error}
            </div>
          )}

          {!status && loading && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#475569', fontSize: '0.82rem' }}>
              <Loader2 size={22} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem', color: '#f0b429' }} />
              Fetching commit data from GitHub…
            </div>
          )}

          {status && (
            <>
              {/* ── Build State Card ── */}
              <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: '0.85rem', padding: '0.85rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {cfg.icon}
                    <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#f1f5f9' }}>{cfg.label}</span>
                  </div>
                  {lastRefresh && (
                    <span style={{ fontSize: '0.65rem', color: '#475569', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Clock size={10} />
                      {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  )}
                </div>
                <CommitRow label="Deployed" sha={status.deployedShort} msg="" date={status.deployedAt} color="#10b981" />
                <CommitRow label="Remote HEAD" sha={status.remoteShort} msg={status.newCommits[0]?.message ?? ''} date={status.remoteAt} color={status.isAhead ? '#f0b429' : '#10b981'} />

                {status.isAhead && (
                  <div style={{ marginTop: '0.6rem', padding: '0.45rem 0.7rem', background: 'rgba(240,180,41,0.12)', border: '1px solid rgba(240,180,41,0.3)', borderRadius: '0.5rem', fontSize: '0.72rem', color: '#f0b429', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ArrowDownCircle size={13} />
                    {status.aheadCount} new commit{status.aheadCount > 1 ? 's' : ''} available — auto-redeploy triggered
                  </div>
                )}

                {!status.isAhead && status.buildState === 'live' && (
                  <div style={{ marginTop: '0.6rem', fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={12} /> Preview is up to date with GitHub
                  </div>
                )}
              </div>

              {/* ── Commit Diff Summary ── */}
              {status.newCommits.length > 0 && (
                <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.85rem', overflow: 'hidden' }}>
                  <button
                    onClick={() => setShowDiff(d => !d)}
                    style={{ width: '100%', padding: '0.65rem 1rem', background: 'rgba(255,255,255,0.03)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.78rem', fontWeight: 700 }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <GitCommit size={13} style={{ color: '#f0b429' }} />
                      Commit Diff — {status.newCommits.length} new commit{status.newCommits.length > 1 ? 's' : ''}
                    </span>
                    {showDiff ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {showDiff && (
                    <div style={{ maxHeight: 260, overflowY: 'auto', padding: '0.5rem 0' }}>
                      {status.newCommits.map((c, i) => (
                        <div key={c.sha} style={{
                          padding: '0.55rem 1rem',
                          borderBottom: i < status.newCommits.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                          display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                        }}>
                          <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 2, background: i === 0 ? '#f0b429' : '#334155', flexShrink: 0, marginTop: 2 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.15rem' }}>
                              <code style={{ fontSize: '0.68rem', background: 'rgba(255,255,255,0.07)', color: i === 0 ? '#f0b429' : '#94a3b8', padding: '0.05rem 0.4rem', borderRadius: 4, fontFamily: 'monospace' }}>
                                {c.short}
                              </code>
                              {i === 0 && <span style={{ fontSize: '0.6rem', background: '#f0b429', color: '#0a0d14', borderRadius: 999, padding: '0.05rem 0.35rem', fontWeight: 900 }}>LATEST</span>}
                            </div>
                            <p style={{ fontSize: '0.78rem', color: '#f1f5f9', margin: '0 0 0.15rem', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {c.message}
                            </p>
                            <div style={{ fontSize: '0.65rem', color: '#475569', display: 'flex', gap: '0.5rem' }}>
                              <span>{c.author}</span>
                              <span>·</span>
                              <span>{new Date(c.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                              <a href={c.url} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 2 }}>
                                View <ExternalLink size={9} />
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Deploy / Rollback Actions ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {/* Deploy latest */}
                <button
                  onClick={() => handleDeploy()}
                  disabled={deploying || rollingBack || (!status.isAhead && status.buildState !== 'failed')}
                  style={{
                    padding: '0.7rem 1rem', borderRadius: '0.65rem', border: 'none', cursor: 'pointer',
                    background: deploying ? 'rgba(240,180,41,0.15)' : 'linear-gradient(135deg,#f0b429,#f59e0b)',
                    color: deploying ? '#f0b429' : '#0a0d14',
                    fontWeight: 800, fontSize: '0.82rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    opacity: (!status.isAhead && status.buildState !== 'failed' && !deploying) ? 0.4 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  {deploying
                    ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Deploying…</>
                    : <><ArrowDownCircle size={14} /> Deploy Latest ({status.remoteShort})</>}
                </button>

                {/* Rollback */}
                {status.rollbackAvailable && status.lastGoodCommit && (
                  <>
                    {!confirmRollback ? (
                      <button
                        onClick={() => setConfirmRollback(true)}
                        disabled={deploying || rollingBack}
                        style={{
                          padding: '0.6rem 1rem', borderRadius: '0.65rem',
                          border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer',
                          background: 'rgba(239,68,68,0.07)', color: '#fca5a5',
                          fontWeight: 700, fontSize: '0.78rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        }}
                      >
                        <RotateCcw size={13} /> Rollback to {status.lastGoodCommit.slice(0, 7)}
                      </button>
                    ) : (
                      <div style={{ padding: '0.75rem', borderRadius: '0.65rem', border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.06)' }}>
                        <p style={{ fontSize: '0.75rem', color: '#fca5a5', marginBottom: '0.6rem', fontWeight: 600 }}>
                          ⚠ Roll back to <code style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.06)', padding: '0 4px', borderRadius: 3 }}>{status.lastGoodCommit.slice(0, 7)}</code>?
                          {status.lastGoodAt && (
                            <span style={{ color: '#64748b', fontWeight: 400 }}> (deployed {new Date(status.lastGoodAt).toLocaleDateString()})</span>
                          )}
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={handleRollback}
                            disabled={rollingBack}
                            style={{ flex: 1, padding: '0.5rem', borderRadius: '0.5rem', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                          >
                            {rollingBack ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <RotateCcw size={12} />}
                            {rollingBack ? 'Rolling back…' : 'Confirm Rollback'}
                          </button>
                          <button
                            onClick={() => setConfirmRollback(false)}
                            style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', cursor: 'pointer', fontSize: '0.78rem' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* ── Info footer ── */}
              <div style={{ fontSize: '0.65rem', color: '#334155', lineHeight: 1.6, paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.25rem' }}>
                  <span>Build SHA: <code style={{ fontFamily: 'monospace' }}>{CURRENT_COMMIT.slice(0, 7)}</code></span>
                  <span>Poll: every 60s</span>
                </div>
                <div>Auto-redeploy: {status.isAhead ? '⚡ triggered' : '✓ monitoring'}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Compact row used in build state card ───────────────────────────────────
const CommitRow: React.FC<{ label: string; sha: string; msg: string; date: string; color: string }> = ({ label, sha, msg, date, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
    <span style={{ fontSize: '0.65rem', color: '#475569', minWidth: 72, fontWeight: 600 }}>{label}</span>
    <code style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)', color, padding: '0.05rem 0.4rem', borderRadius: 4, fontFamily: 'monospace', fontWeight: 700 }}>{sha}</code>
    {msg && <span style={{ fontSize: '0.68rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{msg}</span>}
    {date && <span style={{ fontSize: '0.62rem', color: '#334155', marginLeft: 'auto', whiteSpace: 'nowrap' }}>{new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>}
  </div>
);
