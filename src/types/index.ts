// ─── Industry Knowledge Engine ────────────────────────────────────────────────
export interface IndustryData {
  industry: string;
  focuses: string[];
  risks: string[];
}

// ─── Seniority Level ──────────────────────────────────────────────────────────
export interface SeniorityLevel {
  id: 'entry' | 'junior' | 'senior';
  label: string;
  tone: string;
}

// ─── Training Stage ───────────────────────────────────────────────────────────
export interface TrainingStage {
  id: number;
  title_en: string;
  title_ar: string;
  title_ku: string;
  scenario_operational: string;
  scenario_growth: string;
  scenario_dispute: string;
  scenario_emergency: string;
  focus_area: string;
  risk_context: string;
}

// ─── Exam ─────────────────────────────────────────────────────────────────────
export interface TrainingExam {
  id: number;
  title_en: string;
  title_ar: string;
  title_ku: string;
  questions_count: number;
  passing_score: number;
}

// ─── Full Payload ─────────────────────────────────────────────────────────────
export interface TrainingPayload {
  stages: TrainingStage[];
  exams: TrainingExam[];
}

// ─── App Configuration ────────────────────────────────────────────────────────
export interface AppConfig {
  industry: string;
  department: string;           // department id (e.g. 'fmcg_sales') — optional
  productCategories: string[];  // product category ids — only for Distribution Company
  jobTitle: string;
  seniorityId: 'entry' | 'junior' | 'senior' | '';
  policyText: string;
}

// ─── Validation Result ────────────────────────────────────────────────────────
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ─── Field-level Errors (per step) ───────────────────────────────────────────
export interface Step1Errors {
  industry?: string;
  department?: string;
  jobTitle?: string;
  seniorityId?: string;
}

export interface Step3Errors {
  json?: string;
}

export interface Step5Errors {
  matrixTitle?: string;
}

// ─── Export Options ───────────────────────────────────────────────────────────
export interface ExportOptions {
  antiCopy: boolean;
  bilingualToggle: boolean;
  matrixTitle: string;
}

// ─── i18n Labels ──────────────────────────────────────────────────────────────
export interface I18nEntry {
  en: string;
  ar: string;
  ku: string;
}

// ─── Draft System ─────────────────────────────────────────────────────────────
export interface DraftSnapshot {
  id: string;               // uuid-style
  name: string;             // user-visible label
  createdAt: string;        // ISO timestamp
  updatedAt: string;        // ISO timestamp
  step: number;             // wizard step when saved
  config: AppConfig;
  payload: TrainingPayload | null;
  exportOptions: ExportOptions;
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export type AnalyticsEventName =
  | 'step_1_completed'
  | 'step_2_prompt_copied'
  | 'step_2_prompt_downloaded'
  | 'step_2_completed'
  | 'step_3_validate_attempted'
  | 'step_3_validate_failed_json'
  | 'step_3_validate_failed_schema'
  | 'step_3_completed'
  | 'step_4_stage_edited'
  | 'step_4_exam_edited'
  | 'step_4_full_validation_run'
  | 'step_4_completed'
  | 'step_5_html_downloaded'
  | 'step_5_pdf_downloaded'
  | 'step_5_completed'
  | 'draft_saved'
  | 'draft_loaded'
  | 'draft_deleted'
  | 'draft_exported'
  | 'draft_imported'
  | 'session_started'
  | 'session_reset';

export interface AnalyticsEvent {
  id: string;
  name: AnalyticsEventName;
  ts: number;               // epoch ms
  meta?: Record<string, string | number | boolean>;
}

export interface AnalyticsSummary {
  totalEvents: number;
  stepCompletions: Record<string, number>;
  dropOffs: Record<string, number>;
  conversionRate: number;   // step1→step5 %
  topEvents: Array<{ name: string; count: number }>;
  sessionCount: number;
  lastActivity: string;
}

export type WizardStep = 1 | 2 | 3 | 4 | 5;
