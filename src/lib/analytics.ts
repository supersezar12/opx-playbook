/**
 * OPX Analytics Engine — 100% client-side, zero external calls.
 * All events stored in localStorage under 'opx_analytics'.
 * Provides step-completion funnels, drop-off detection, and conversion rates.
 */

import type { AnalyticsEvent, AnalyticsEventName, AnalyticsSummary } from '../types';

const STORAGE_KEY = 'opx_analytics';
const MAX_EVENTS = 2000; // prevent unbounded growth

// ─── Tiny deterministic ID ────────────────────────────────────────────────────
function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Read / Write ─────────────────────────────────────────────────────────────
function readEvents(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AnalyticsEvent[]) : [];
  } catch {
    return [];
  }
}

function writeEvents(events: AnalyticsEvent[]): void {
  try {
    // Keep most recent MAX_EVENTS
    const trimmed = events.slice(-MAX_EVENTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage full — silently discard
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────
export const analytics = {
  /**
   * Fire a named event with optional metadata.
   * Returns the event for chaining / inspection.
   */
  track(name: AnalyticsEventName, meta?: Record<string, string | number | boolean>): AnalyticsEvent {
    const event: AnalyticsEvent = { id: uid(), name, ts: Date.now(), meta };
    const events = readEvents();
    events.push(event);
    writeEvents(events);
    // Dev-mode console trace (no-op in prod bundles if tree-shaken)
    if (import.meta.env.DEV) {
      console.debug(`[OPX Analytics] ${name}`, meta ?? '');
    }
    return event;
  },

  /** Return all stored events (newest last). */
  getAll(): AnalyticsEvent[] {
    return readEvents();
  },

  /** Compute aggregated summary for the dashboard. */
  getSummary(): AnalyticsSummary {
    const events = readEvents();

    // Count by name
    const counts: Record<string, number> = {};
    events.forEach(e => { counts[e.name] = (counts[e.name] ?? 0) + 1; });

    const stepCompletions: Record<string, number> = {
      step_1: counts['step_1_completed'] ?? 0,
      step_2: counts['step_2_completed'] ?? 0,
      step_3: counts['step_3_completed'] ?? 0,
      step_4: counts['step_4_completed'] ?? 0,
      step_5: counts['step_5_completed'] ?? 0,
    };

    // Drop-off = previous step completions minus current
    const dropOffs: Record<string, number> = {
      'after_step_1': Math.max(0, stepCompletions.step_1 - stepCompletions.step_2),
      'after_step_2': Math.max(0, stepCompletions.step_2 - stepCompletions.step_3),
      'after_step_3': Math.max(0, stepCompletions.step_3 - stepCompletions.step_4),
      'after_step_4': Math.max(0, stepCompletions.step_4 - stepCompletions.step_5),
    };

    const s1 = stepCompletions.step_1;
    const s5 = stepCompletions.step_5;
    const conversionRate = s1 > 0 ? Math.round((s5 / s1) * 100) : 0;

    const topEvents = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    const lastEvent = events[events.length - 1];
    const lastActivity = lastEvent
      ? new Date(lastEvent.ts).toLocaleString()
      : 'Never';

    return {
      totalEvents: events.length,
      stepCompletions,
      dropOffs,
      conversionRate,
      topEvents,
      sessionCount: counts['session_started'] ?? 0,
      lastActivity,
    };
  },

  /** Erase all analytics data. */
  clearAll(): void {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  },
};
