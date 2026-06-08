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

export type WizardStep = 1 | 2 | 3 | 4 | 5;
