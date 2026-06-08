import type { TrainingPayload, ValidationResult } from '../types';

const STAGE_REQUIRED_KEYS = [
  'id', 'title_en', 'title_ar', 'title_ku',
  'scenario_operational', 'scenario_growth', 'scenario_dispute', 'scenario_emergency',
  'focus_area', 'risk_context',
] as const;

const EXAM_REQUIRED_KEYS = [
  'id', 'title_en', 'title_ar', 'title_ku', 'questions_count', 'passing_score',
] as const;

export function validatePayload(raw: string): { result?: TrainingPayload; error?: string; schemaErrors?: string[] } {
  // Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e: unknown) {
    return { error: `JSON Parse Error: ${(e as Error).message}` };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { error: 'Root value must be a JSON object { }' };
  }

  const obj = parsed as Record<string, unknown>;
  const schemaErrors: string[] = [];

  // Check stages
  if (!Array.isArray(obj.stages)) {
    schemaErrors.push('Missing required field: "stages" must be an array.');
  } else {
    if (obj.stages.length !== 60) {
      schemaErrors.push(`"stages" array has ${obj.stages.length} items — expected exactly 60.`);
    }
    obj.stages.forEach((stage: unknown, idx: number) => {
      if (typeof stage !== 'object' || stage === null) {
        schemaErrors.push(`Stage at index ${idx} is not an object.`);
        return;
      }
      const s = stage as Record<string, unknown>;
      STAGE_REQUIRED_KEYS.forEach(key => {
        if (s[key] === undefined || s[key] === null || s[key] === '') {
          schemaErrors.push(`Stage ${s['id'] ?? idx + 1} missing or empty field: "${key}".`);
        }
      });
    });
  }

  // Check exams
  if (!Array.isArray(obj.exams)) {
    schemaErrors.push('Missing required field: "exams" must be an array.');
  } else {
    if (obj.exams.length !== 7) {
      schemaErrors.push(`"exams" array has ${obj.exams.length} items — expected exactly 7.`);
    }
    obj.exams.forEach((exam: unknown, idx: number) => {
      if (typeof exam !== 'object' || exam === null) {
        schemaErrors.push(`Exam at index ${idx} is not an object.`);
        return;
      }
      const e = exam as Record<string, unknown>;
      EXAM_REQUIRED_KEYS.forEach(key => {
        if (e[key] === undefined || e[key] === null || e[key] === '') {
          schemaErrors.push(`Exam ${e['id'] ?? idx + 1} missing or empty field: "${key}".`);
        }
      });
    });
  }

  if (schemaErrors.length > 0) {
    return { schemaErrors };
  }

  return { result: parsed as TrainingPayload };
}

export function runFullValidation(payload: TrainingPayload): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  payload.stages.forEach(stage => {
    const missing: string[] = [];
    if (!stage.scenario_operational?.trim()) missing.push('scenario_operational');
    if (!stage.scenario_growth?.trim()) missing.push('scenario_growth');
    if (!stage.scenario_dispute?.trim()) missing.push('scenario_dispute');
    if (!stage.scenario_emergency?.trim()) missing.push('scenario_emergency');
    if (!stage.title_ar?.trim()) missing.push('title_ar');
    if (!stage.title_ku?.trim()) missing.push('title_ku');
    if (missing.length > 0) {
      errors.push(`Stage ${stage.id} ("${stage.title_en}"): missing fields — ${missing.join(', ')}`);
    }
  });

  payload.exams.forEach(exam => {
    if (!exam.title_ar?.trim()) warnings.push(`Exam ${exam.id}: missing Arabic title.`);
    if (!exam.title_ku?.trim()) warnings.push(`Exam ${exam.id}: missing Kurdish title.`);
    if (typeof exam.questions_count !== 'number') warnings.push(`Exam ${exam.id}: questions_count is not a number.`);
    if (typeof exam.passing_score !== 'number') warnings.push(`Exam ${exam.id}: passing_score is not a number.`);
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function isStageComplete(stage: Record<string, unknown>): boolean {
  return Boolean(
    stage.scenario_operational &&
    stage.scenario_growth &&
    stage.scenario_dispute &&
    stage.scenario_emergency &&
    String(stage.scenario_operational).trim() &&
    String(stage.scenario_growth).trim() &&
    String(stage.scenario_dispute).trim() &&
    String(stage.scenario_emergency).trim()
  );
}
