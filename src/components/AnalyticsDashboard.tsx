import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, Activity,
  Users, Zap, RefreshCw, Trash2, Clock, ChevronRight,
} from 'lucide-react';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { analytics } from '../lib/analytics';
import type { AnalyticsSummary, AnalyticsEvent } from '../types';

interface AnalyticsDashboardProps {
  open: boolean;
  onClose: () => void;
  onToast: (variant: 'success' | 'error' | 'warning' | 'info', title: string, msg?: string) => void;
}

const STEP_LABELS: Record<string, string> = {
  step_1: '1 · Configure',
  step_2: '2 · Generate',
  step_3: '3 · Ingest',
  step_4: '4 · Audit',
  step_5: '5 · Export',
};

const FRIENDLY: Record<string, string> = {
  step_1_completed:             '✅ Step 1 Completed',
  step_2_prompt_copied:         '📋 Prompt Copied',
  step_2_prompt_downloaded:     '⬇ Prompt Downloaded',
  step_2_completed:             '✅ Step 2 Completed',
  step_3_validate_attempted:    '🔍 Validate Attempted',
  step_3_validate_failed_json:  '❌ JSON Parse Error',
  step_3_validate_failed_schema:'❌ Schema Error',
  step_3_completed:             '✅ Step 3 Completed',
  step_4_stage_edited:          '✏️ Stage Edited',
  step_4_exam_edited:           '✏️ Exam Edited',
  step_4_full_validation_run:   '🛡 Full Validation Run',
  step_4_completed:             '✅ Step 4 Completed',
  step_5_html_downloaded:       '⬇ HTML Downloaded',
  step_5_pdf_downloaded:        '📄 PDF Downloaded',
  step_5_completed:             '✅ Step 5 Completed',
  draft_saved:                  '💾 Draft Saved',
  draft_loaded:                 '📂 Draft Loaded',
  draft_deleted:                '🗑 Draft Deleted',
  draft_exported:               '⬇ Draft Exported',
  draft_imported:               '⬆ Draft Imported',
  session_started:              '🚀 Session Started',
  session_reset:                '♻️ Session Reset',
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  open, onClose, onToast,
}) => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [recentEvents, setRecentEvents] = useState<AnalyticsEvent[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const refresh = () => {
    setSummary(analytics.getSummary());
    setRecentEvents(analytics.getAll().slice(-20).reverse());
  };

  useEffect(() => { if (open) { refresh(); setShowClearConfirm(false); } }, [open]);

  const handleClear = () => {
    analytics.clearAll();
    onToast('info', 'Analytics cleared', 'All event data has been erased.');
    setShowClearConfirm(false);
    refresh();
  };

  if (!summary) return null;

  const stepEntries = Object.entries(summary.stepCompletions);
  const maxCompletions = Math.max(...stepEntries.map(([, v]) => v), 1);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Analytics Dashboard"
      description="Client-side funnel analytics — no data leaves your browser."
      maxWidth="xl"
    >
      <div className="space-y-5">

        {/* ─── Top KPIs ─────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard icon={<Activity className="h-4 w-4 text-blue-600" />} bg="bg-blue-50"
            value={summary.totalEvents.toLocaleString()} label="Total Events" />
          <KpiCard icon={<Users className="h-4 w-4 text-purple-600" />} bg="bg-purple-50"
            value={summary.sessionCount.toLocaleString()} label="Sessions" />
          <KpiCard icon={<TrendingUp className="h-4 w-4 text-emerald-600" />} bg="bg-emerald-50"
            value={`${summary.conversionRate}%`} label="Step 1→5 Conversion" />
          <KpiCard icon={<Clock className="h-4 w-4 text-amber-600" />} bg="bg-amber-50"
            value={summary.lastActivity === 'Never' ? '—' : summary.lastActivity.split(',')[0]}
            label="Last Activity" />
        </div>

        {/* ─── Funnel ───────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-sm text-gray-800">Step Completion Funnel</span>
          </div>
          <div className="space-y-2.5">
            {stepEntries.map(([step, count], idx) => {
              const prev = idx > 0 ? stepEntries[idx - 1][1] : count;
              const dropOff = prev > 0 ? Math.round(((prev - count) / prev) * 100) : 0;
              const pct = Math.round((count / maxCompletions) * 100);
              return (
                <div key={step}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">{STEP_LABELS[step]}</span>
                    <div className="flex items-center gap-2">
                      {idx > 0 && dropOff > 0 && (
                        <span className="text-xs text-red-500 flex items-center gap-0.5">
                          <TrendingDown className="h-3 w-3" />
                          −{dropOff}% drop
                        </span>
                      )}
                      <Badge variant={count > 0 ? 'success' : 'default'}>{count} completions</Badge>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                  {idx < stepEntries.length - 1 && (
                    <div className="flex justify-center mt-1">
                      <ChevronRight className="h-3 w-3 text-gray-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Drop-off Summary ─────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(summary.dropOffs).map(([key, count]) => (
            <div key={key} className={`rounded-xl p-3 text-center border ${count > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`text-lg font-bold ${count > 0 ? 'text-red-600' : 'text-gray-400'}`}>{count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{key.replace(/_/g, ' ')}</p>
            </div>
          ))}
        </div>

        {/* ─── Top Events ───────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="font-semibold text-sm text-gray-800">Top Events</span>
          </div>
          {summary.topEvents.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No events recorded yet. Complete a wizard step to start tracking.</p>
          ) : (
            <div className="space-y-1.5">
              {summary.topEvents.map(({ name, count }, i) => (
                <div key={name} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-4 text-right flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${Math.round((count / summary.topEvents[0].count) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-700 flex-1 truncate">{FRIENDLY[name] ?? name}</span>
                  <Badge variant="default">{count}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Recent Events ────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <span className="font-semibold text-sm text-gray-800 block mb-3">Recent Event Log (last 20)</span>
          {recentEvents.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No events yet.</p>
          ) : (
            <div className="space-y-1 max-h-40 overflow-y-auto font-mono text-xs">
              {recentEvents.map(e => (
                <div key={e.id} className="flex items-center gap-2 text-gray-600">
                  <span className="text-gray-400 flex-shrink-0">
                    {new Date(e.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className="text-blue-700">{FRIENDLY[e.name] ?? e.name}</span>
                  {e.meta && Object.keys(e.meta).length > 0 && (
                    <span className="text-gray-400 truncate">
                      {Object.entries(e.meta).map(([k, v]) => `${k}=${v}`).join(' ')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Footer Actions ───────────────────────────── */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={refresh}>
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            {!showClearConfirm ? (
              <Button variant="ghost" size="sm" onClick={() => setShowClearConfirm(true)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="h-3.5 w-3.5" />
                Clear All Data
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-600 font-medium">Erase all analytics?</span>
                <Button variant="destructive" size="sm" onClick={handleClear}>Yes, erase</Button>
                <Button variant="ghost" size="sm" onClick={() => setShowClearConfirm(false)}>Cancel</Button>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400">All data stored locally in your browser only.</p>
        </div>

      </div>
    </Dialog>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard: React.FC<{
  icon: React.ReactNode; bg: string; value: string; label: string;
}> = ({ icon, bg, value, label }) => (
  <div className={`${bg} rounded-xl p-3 border border-white`}>
    <div className="flex items-center gap-1.5 mb-1">{icon}</div>
    <p className="text-xl font-bold text-gray-900">{value}</p>
    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
  </div>
);
