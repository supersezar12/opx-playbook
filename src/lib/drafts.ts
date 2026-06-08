/**
 * OPX Draft Management — named draft slots stored in localStorage.
 * Supports save, load, delete, rename, export-to-file, import-from-file.
 */

import type { DraftSnapshot, AppConfig, TrainingPayload, ExportOptions } from '../types';

const DRAFTS_KEY = 'opx_drafts';

// ─── Tiny ID ──────────────────────────────────────────────────────────────────
function uid(): string {
  return `draft_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

// ─── Read / Write ─────────────────────────────────────────────────────────────
function readDrafts(): DraftSnapshot[] {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    return raw ? (JSON.parse(raw) as DraftSnapshot[]) : [];
  } catch {
    return [];
  }
}

function writeDrafts(drafts: DraftSnapshot[]): void {
  try {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  } catch (e) {
    throw new Error('Storage quota exceeded. Please delete old drafts before saving.');
  }
}

// ─── Validation ───────────────────────────────────────────────────────────────
function isDraftSnapshot(obj: unknown): obj is DraftSnapshot {
  if (!obj || typeof obj !== 'object') return false;
  const d = obj as Record<string, unknown>;
  return (
    typeof d.id === 'string' &&
    typeof d.name === 'string' &&
    typeof d.createdAt === 'string' &&
    typeof d.updatedAt === 'string' &&
    typeof d.step === 'number' &&
    typeof d.config === 'object'
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────
export const drafts = {
  /** List all saved drafts, newest first. */
  list(): DraftSnapshot[] {
    return readDrafts().sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  /** Create a new draft from current wizard state. Returns the new draft. */
  save(
    name: string,
    step: number,
    config: AppConfig,
    payload: TrainingPayload | null,
    exportOptions: ExportOptions,
    existingId?: string
  ): DraftSnapshot {
    const all = readDrafts();
    const now = new Date().toISOString();

    if (existingId) {
      // Update existing
      const idx = all.findIndex(d => d.id === existingId);
      if (idx !== -1) {
        all[idx] = { ...all[idx], name, step, config, payload, exportOptions, updatedAt: now };
        writeDrafts(all);
        return all[idx];
      }
    }

    // Create new
    const draft: DraftSnapshot = {
      id: uid(),
      name: name.trim() || `Draft — ${new Date().toLocaleDateString()}`,
      createdAt: now,
      updatedAt: now,
      step,
      config,
      payload,
      exportOptions,
    };
    all.push(draft);
    writeDrafts(all);
    return draft;
  },

  /** Load a draft by ID. Returns null if not found. */
  load(id: string): DraftSnapshot | null {
    return readDrafts().find(d => d.id === id) ?? null;
  },

  /** Delete a draft by ID. */
  delete(id: string): void {
    writeDrafts(readDrafts().filter(d => d.id !== id));
  },

  /** Rename a draft. */
  rename(id: string, newName: string): void {
    const all = readDrafts();
    const idx = all.findIndex(d => d.id === id);
    if (idx !== -1) {
      all[idx].name = newName.trim();
      all[idx].updatedAt = new Date().toISOString();
      writeDrafts(all);
    }
  },

  /** Export a single draft as a downloadable .json file. */
  exportToFile(id: string): void {
    const draft = readDrafts().find(d => d.id === id);
    if (!draft) throw new Error('Draft not found.');
    const json = JSON.stringify(draft, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OPX_Draft_${draft.name.replace(/\W+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  /** Parse a .json file and import as a draft. Returns the imported draft. */
  async importFromFile(file: File): Promise<DraftSnapshot> {
    const text = await file.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error('Invalid JSON file. Could not parse draft.');
    }
    if (!isDraftSnapshot(parsed)) {
      throw new Error('File does not contain a valid OPX draft snapshot.');
    }
    // Assign a new id to avoid collisions
    const all = readDrafts();
    const now = new Date().toISOString();
    const imported: DraftSnapshot = {
      ...parsed,
      id: uid(),
      name: `${parsed.name} (imported)`,
      updatedAt: now,
    };
    all.push(imported);
    writeDrafts(all);
    return imported;
  },

  /** Count stored drafts. */
  count(): number {
    return readDrafts().length;
  },
};
