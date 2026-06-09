/**
 * OPX Draft Management — named draft slots stored in localStorage.
 * Supports save, load, delete, rename, export-to-file, import-from-file.
 *
 * Import validation (v1.5.1):
 *  - Strict field-by-field schema check with targeted error messages
 *  - Type, range, and format assertions on every field
 *  - Payload schema validated when present (60 stages × 10 fields, 7 exams × 6 fields)
 *  - Returns a DraftValidationResult with per-field error list before accepting import
 */

import type { DraftSnapshot, AppConfig, TrainingPayload, ExportOptions } from '../types';

const DRAFTS_KEY = 'opx_drafts';

/* ── ID generator ────────────────────────────────────────────────────────── */
function uid(): string {
  return `draft_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

/* ── Storage helpers ─────────────────────────────────────────────────────── */
function readDrafts(): DraftSnapshot[] {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    return raw ? (JSON.parse(raw) as DraftSnapshot[]) : [];
  } catch {
    return [];
  }
}

function writeDrafts(list: DraftSnapshot[]): void {
  try {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(list));
  } catch {
    throw new Error('Storage quota exceeded. Please delete old drafts before saving.');
  }
}

/* ══════════════════════════════════════════════════════════════════════════════
   STRICT IMPORT VALIDATION
   Returns an array of human-readable error strings.
   An empty array means the draft is valid.
══════════════════════════════════════════════════════════════════════════════ */

const SENIORITY_IDS = ['entry', 'junior', 'senior', ''] as const;
const TEMPLATE_IDS  = ['executive', 'academy', 'ops']   as const;
const VALID_STEPS   = [1, 2, 3, 4, 5];

/** Validate a single stage object inside the payload. */
function validateStage(s: unknown, idx: number): string[] {
  const errs: string[] = [];
  const prefix = `payload.stages[${idx}]`;

  if (!s || typeof s !== 'object' || Array.isArray(s)) {
    return [`${prefix} is not an object.`];
  }
  const o = s as Record<string, unknown>;

  if (typeof o.id !== 'number' || !Number.isInteger(o.id) || o.id < 1 || o.id > 60) {
    errs.push(`${prefix}.id must be an integer 1–60 (got ${JSON.stringify(o.id)}).`);
  }
  for (const field of [
    'title_en', 'title_ar', 'title_ku',
    'scenario_operational', 'scenario_growth', 'scenario_dispute', 'scenario_emergency',
    'focus_area', 'risk_context',
  ] as const) {
    if (typeof o[field] !== 'string') {
      errs.push(`${prefix}.${field} must be a string (got ${typeof o[field]}).`);
    } else if ((o[field] as string).trim() === '') {
      errs.push(`${prefix}.${field} is empty.`);
    }
  }
  return errs;
}

/** Validate a single exam object inside the payload. */
function validateExam(e: unknown, idx: number): string[] {
  const errs: string[] = [];
  const prefix = `payload.exams[${idx}]`;

  if (!e || typeof e !== 'object' || Array.isArray(e)) {
    return [`${prefix} is not an object.`];
  }
  const o = e as Record<string, unknown>;

  if (typeof o.id !== 'number' || !Number.isInteger(o.id) || o.id < 1 || o.id > 7) {
    errs.push(`${prefix}.id must be an integer 1–7 (got ${JSON.stringify(o.id)}).`);
  }
  for (const field of ['title_en', 'title_ar', 'title_ku'] as const) {
    if (typeof o[field] !== 'string') {
      errs.push(`${prefix}.${field} must be a string (got ${typeof o[field]}).`);
    } else if ((o[field] as string).trim() === '') {
      errs.push(`${prefix}.${field} is empty.`);
    }
  }
  if (typeof o.questions_count !== 'number' || o.questions_count < 1) {
    errs.push(`${prefix}.questions_count must be a positive number (got ${JSON.stringify(o.questions_count)}).`);
  }
  if (typeof o.passing_score !== 'number' || o.passing_score < 1 || o.passing_score > 100) {
    errs.push(`${prefix}.passing_score must be a number between 1 and 100 (got ${JSON.stringify(o.passing_score)}).`);
  }
  return errs;
}

/** Validate payload when present. */
function validatePayloadField(p: unknown): string[] {
  const errs: string[] = [];
  if (!p || typeof p !== 'object' || Array.isArray(p)) {
    return ['payload must be an object with "stages" and "exams" arrays.'];
  }
  const o = p as Record<string, unknown>;

  if (!Array.isArray(o.stages)) {
    errs.push('payload.stages must be an array.');
  } else {
    if (o.stages.length !== 60) {
      errs.push(`payload.stages must contain exactly 60 items (found ${o.stages.length}).`);
    }
    // Check up to first 5 + last stage to give quick feedback without full scan
    const sampleIdx = o.stages.length <= 10
      ? o.stages.map((_: unknown, i: number) => i)
      : [0, 1, 2, o.stages.length - 2, o.stages.length - 1];
    for (const i of sampleIdx) {
      errs.push(...validateStage(o.stages[i], i));
    }
    if (errs.length === 0 && o.stages.length === 60) {
      // Full scan only if sample passed
      for (let i = 3; i < o.stages.length - 2; i++) {
        errs.push(...validateStage(o.stages[i], i));
        if (errs.length >= 10) {
          errs.push(`…and more errors. Fix the above ${errs.length} issues first.`);
          break;
        }
      }
    }
  }

  if (!Array.isArray(o.exams)) {
    errs.push('payload.exams must be an array.');
  } else {
    if (o.exams.length !== 7) {
      errs.push(`payload.exams must contain exactly 7 items (found ${o.exams.length}).`);
    }
    o.exams.forEach((ex: unknown, i: number) => {
      errs.push(...validateExam(ex, i));
    });
  }
  return errs;
}

/** Validate AppConfig sub-object. */
function validateConfig(c: unknown): string[] {
  const errs: string[] = [];
  if (!c || typeof c !== 'object' || Array.isArray(c)) {
    return ['config must be an object.'];
  }
  const o = c as Record<string, unknown>;

  if (typeof o.industry !== 'string') {
    errs.push(`config.industry must be a string (got ${typeof o.industry}).`);
  }
  if (typeof o.department !== 'string' && o.department !== undefined) {
    errs.push(`config.department must be a string or omitted (got ${typeof o.department}).`);
  }
  if (typeof o.jobTitle !== 'string') {
    errs.push(`config.jobTitle must be a string (got ${typeof o.jobTitle}).`);
  }
  if (!SENIORITY_IDS.includes(o.seniorityId as typeof SENIORITY_IDS[number])) {
    errs.push(`config.seniorityId must be one of: ${SENIORITY_IDS.map(s=>s||'(empty)').join(', ')} (got ${JSON.stringify(o.seniorityId)}).`);
  }
  if (typeof o.policyText !== 'string' && o.policyText !== undefined) {
    errs.push(`config.policyText must be a string or omitted (got ${typeof o.policyText}).`);
  }
  if (o.productCategories !== undefined && !Array.isArray(o.productCategories)) {
    errs.push(`config.productCategories must be an array or omitted (got ${typeof o.productCategories}).`);
  }
  return errs;
}

/** Validate ExportOptions sub-object. */
function validateExportOptions(e: unknown): string[] {
  const errs: string[] = [];
  if (!e || typeof e !== 'object' || Array.isArray(e)) {
    return ['exportOptions must be an object.'];
  }
  const o = e as Record<string, unknown>;

  if (typeof o.antiCopy !== 'boolean' && o.antiCopy !== undefined) {
    errs.push(`exportOptions.antiCopy must be a boolean (got ${typeof o.antiCopy}).`);
  }
  if (typeof o.bilingualToggle !== 'boolean' && o.bilingualToggle !== undefined) {
    errs.push(`exportOptions.bilingualToggle must be a boolean (got ${typeof o.bilingualToggle}).`);
  }
  if (typeof o.matrixTitle !== 'string' && o.matrixTitle !== undefined) {
    errs.push(`exportOptions.matrixTitle must be a string (got ${typeof o.matrixTitle}).`);
  }
  if (o.templateId !== undefined && !TEMPLATE_IDS.includes(o.templateId as typeof TEMPLATE_IDS[number])) {
    errs.push(`exportOptions.templateId must be one of: ${TEMPLATE_IDS.join(', ')} (got ${JSON.stringify(o.templateId)}).`);
  }
  return errs;
}

/** Full draft snapshot validation — returns list of human-readable errors. */
export function validateDraftImport(obj: unknown): string[] {
  const errs: string[] = [];

  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return ['File root is not a JSON object. A valid OPX draft must be a single { } object.'];
  }
  const d = obj as Record<string, unknown>;

  // ── Top-level required fields ──
  if (typeof d.id !== 'string' || d.id.trim() === '') {
    errs.push('Missing or invalid field "id" — must be a non-empty string.');
  } else if (!/^draft_/.test(d.id)) {
    errs.push(`"id" does not look like an OPX draft ID (expected "draft_…", got "${d.id}"). Is this a genuine OPX export?`);
  }

  if (typeof d.name !== 'string' || d.name.trim() === '') {
    errs.push('Missing or invalid field "name" — must be a non-empty string.');
  } else if (d.name.length > 200) {
    errs.push(`"name" is too long (${d.name.length} chars, max 200).`);
  }

  if (typeof d.createdAt !== 'string' || isNaN(Date.parse(d.createdAt))) {
    errs.push(`"createdAt" must be a valid ISO date string (got ${JSON.stringify(d.createdAt)}).`);
  }

  if (typeof d.updatedAt !== 'string' || isNaN(Date.parse(d.updatedAt))) {
    errs.push(`"updatedAt" must be a valid ISO date string (got ${JSON.stringify(d.updatedAt)}).`);
  }

  if (typeof d.step !== 'number' || !VALID_STEPS.includes(d.step)) {
    errs.push(`"step" must be an integer 1–5 (got ${JSON.stringify(d.step)}).`);
  }

  // ── Config ──
  if (d.config === undefined || d.config === null) {
    errs.push('"config" field is missing entirely.');
  } else {
    errs.push(...validateConfig(d.config).map(e => `  ↳ ${e}`));
  }

  // ── ExportOptions ──
  if (d.exportOptions === undefined || d.exportOptions === null) {
    errs.push('"exportOptions" field is missing entirely.');
  } else {
    errs.push(...validateExportOptions(d.exportOptions).map(e => `  ↳ ${e}`));
  }

  // ── Payload (optional — only validate if present and non-null) ──
  if (d.payload !== null && d.payload !== undefined) {
    const payloadErrs = validatePayloadField(d.payload);
    if (payloadErrs.length > 0) {
      errs.push(`"payload" failed schema validation (${payloadErrs.length} issue${payloadErrs.length > 1 ? 's' : ''}):`);
      errs.push(...payloadErrs.map(e => `  ↳ ${e}`));
    }
  }

  return errs;
}

/** Normalise an imported/loaded config to ensure all fields exist. */
function normaliseConfig(c: Partial<AppConfig>): AppConfig {
  return {
    industry:          typeof c.industry   === 'string' ? c.industry   : '',
    department:        typeof c.department === 'string' ? c.department : '',
    productCategories: Array.isArray(c.productCategories) ? c.productCategories : [],
    jobTitle:          typeof c.jobTitle   === 'string' ? c.jobTitle   : '',
    seniorityId:       (SENIORITY_IDS.includes(c.seniorityId as typeof SENIORITY_IDS[number]) ? c.seniorityId : '') as AppConfig['seniorityId'],
    policyText:        typeof c.policyText === 'string' ? c.policyText : '',
  };
}

/** Normalise ExportOptions to fill missing fields with defaults. */
function normaliseExportOptions(e: Partial<ExportOptions>): ExportOptions {
  return {
    antiCopy:        typeof e.antiCopy        === 'boolean' ? e.antiCopy        : true,
    bilingualToggle: typeof e.bilingualToggle === 'boolean' ? e.bilingualToggle : true,
    matrixTitle:     typeof e.matrixTitle     === 'string'  ? e.matrixTitle     : '',
    templateId:      TEMPLATE_IDS.includes(e.templateId as typeof TEMPLATE_IDS[number])
                       ? (e.templateId as ExportOptions['templateId'])
                       : 'executive',
  };
}

/* ── Public API ──────────────────────────────────────────────────────────── */
export const drafts = {
  /** List all saved drafts, newest first. */
  list(): DraftSnapshot[] {
    return readDrafts().sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  /** Save current wizard state as a named draft. */
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
      const idx = all.findIndex(d => d.id === existingId);
      if (idx !== -1) {
        all[idx] = { ...all[idx], name, step, config, payload, exportOptions, updatedAt: now };
        writeDrafts(all);
        return all[idx];
      }
    }

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

  /** Load a draft by ID. */
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

  /** Download a draft as a .json file. */
  exportToFile(id: string): void {
    const draft = readDrafts().find(d => d.id === id);
    if (!draft) throw new Error('Draft not found.');
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `OPX_Draft_${draft.name.replace(/\W+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  /**
   * Import a draft from a .json File.
   * Runs strict schema validation and throws a detailed Error on failure.
   */
  async importFromFile(file: File): Promise<DraftSnapshot> {
    // ── 1. File type guard ──
    if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
      throw new Error(
        `Invalid file type: "${file.name}" is not a JSON file. ` +
        'Please import a file exported from OPX Playbook Builder (extension: .json).'
      );
    }

    // ── 2. Size guard (10 MB max to prevent DoS) ──
    const MAX_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      throw new Error(
        `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). ` +
        'Maximum allowed size is 10 MB.'
      );
    }

    // ── 3. Parse JSON ──
    let text: string;
    try {
      text = await file.text();
    } catch {
      throw new Error('Could not read the file. It may be corrupted or inaccessible.');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (e: unknown) {
      throw new Error(
        `The file contains invalid JSON and cannot be parsed.\n` +
        `Parser error: ${(e as Error).message}\n` +
        'Make sure the file was not manually edited after export.'
      );
    }

    // ── 4. Strict schema validation ──
    const errors = validateDraftImport(parsed);
    if (errors.length > 0) {
      const summary = errors.slice(0, 8).join('\n');
      const extra   = errors.length > 8 ? `\n…and ${errors.length - 8} more issue(s).` : '';
      throw new Error(
        `Import failed — this file does not match the OPX draft format.\n\n` +
        `Found ${errors.length} validation error${errors.length > 1 ? 's' : ''}:\n` +
        summary + extra + '\n\n' +
        'Only files exported from OPX Playbook Builder via the Draft Manager can be imported.'
      );
    }

    // ── 5. Normalise and persist ──
    const raw = parsed as Record<string, unknown>;
    const now = new Date().toISOString();
    const imported: DraftSnapshot = {
      id:            uid(), // fresh ID to avoid collisions
      name:          `${String(raw.name)} (imported)`,
      createdAt:     typeof raw.createdAt === 'string' ? raw.createdAt : now,
      updatedAt:     now,
      step:          typeof raw.step === 'number' ? raw.step : 1,
      config:        normaliseConfig(raw.config as Partial<AppConfig>),
      payload:       raw.payload != null ? (raw.payload as TrainingPayload) : null,
      exportOptions: normaliseExportOptions(raw.exportOptions as Partial<ExportOptions>),
    };

    const all = readDrafts();
    all.push(imported);
    writeDrafts(all);
    return imported;
  },

  /** Count stored drafts. */
  count(): number {
    return readDrafts().length;
  },
};
