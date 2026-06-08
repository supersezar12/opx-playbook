import { INDUSTRIES_DATA } from '../data/industries';
import { SENIORITY_LEVELS } from '../data/seniority';
import type { AppConfig } from '../types';

export function buildExecutionPrompt(config: AppConfig): string {
  const industryData = INDUSTRIES_DATA.find(i => i.industry === config.industry);
  const seniorityData = SENIORITY_LEVELS.find(s => s.id === config.seniorityId);

  if (!industryData || !seniorityData) return '';

  const focuses = industryData.focuses.map((f, i) => `  ${i + 1}. ${f}`).join('\n');
  const risks = industryData.risks.map((r, i) => `  ${i + 1}. ${r}`).join('\n');
  const policySection = config.policyText.trim()
    ? `\n\n## COMPANY POLICY CONTEXT (Priority Injection)\nThe following raw company policy text must be referenced and embedded throughout the curriculum where relevant. Align scenario content with these policies:\n\n"""\n${config.policyText.trim()}\n"""\n`
    : '';

  return `# OPX PLAYBOOK BUILDER — EXECUTION PROMPT
# Generated: ${new Date().toISOString()}
# ─────────────────────────────────────────────────────────────────────────────

## ROLE & OBJECTIVE
You are an expert corporate training curriculum architect. Your task is to generate a complete, production-grade, bilingual (Arabic + Kurdish) progressive training matrix. This output will be directly compiled into a client-facing training platform, so precision, completeness, and schema compliance are mandatory. No placeholders. No lorem ipsum. All content must be substantive, realistic, and contextually accurate.

## TARGET PROFILE
- Industry:       ${config.industry}
- Job Title:      ${config.jobTitle}
- Seniority:      ${seniorityData.label}
- Tonal Frame:    ${seniorityData.tone}

## INDUSTRY KNOWLEDGE BASE

### Core Focus Areas (embed throughout stages):
${focuses}

### Key Risk Factors (embed throughout stages):
${risks}
${policySection}

## LANGUAGE REQUIREMENTS
1. All trilingual fields (title_en, title_ar, title_ku) must be fully written — not machine-transliterated.
2. Arabic: Use Modern Standard Arabic (فصحى), formal corporate register.
3. Kurdish: Use Sorani dialect (سۆرانی) as the primary target. If a term has no direct Sorani equivalent, provide Kurmanji with a note like "[Kurmanji]".
4. Scenario body text (scenario_operational, scenario_growth, scenario_dispute, scenario_emergency) must be written in English. Each scenario must be 2–4 sentences describing a realistic, role-specific situation that the trainee would encounter.

## CURRICULUM ARCHITECTURE

### Progressive Stage Design (60 Stages)
- Stages 1–12  (Foundation):       Core procedural skills, safety basics, role orientation
- Stages 13–24 (Competency):       Department-level workflows, KPI frameworks, compliance fundamentals
- Stages 25–36 (Proficiency):      Cross-functional coordination, risk identification, performance metrics
- Stages 37–48 (Advanced):         Strategic alignment, escalation protocols, stakeholder management
- Stages 49–60 (Mastery):          Enterprise leadership, crisis command, organizational governance

### Focus Area Distribution
Distribute the 5 focus areas evenly across all 60 stages (12 stages each). Assign each stage exactly ONE focus_area from the list above. The risk_context field must cite one of the 5 key risks as the backdrop for that stage's emergency scenario.

### Scenario Type Definitions (4 per stage)
- ⚙️ Operational (scenario_operational): A day-to-day task, process execution, or procedural challenge the role encounters. Must reflect the focus_area of the stage.
- 💼 Growth (scenario_growth): A professional development challenge, improvement initiative, or capacity-building opportunity. Tone: ${seniorityData.tone}.
- ⚖️ Dispute (scenario_dispute): An interpersonal, inter-departmental, contractual, or ethical conflict that requires resolution. Reflect realistic friction points in the ${config.industry} industry.
- 🚨 Emergency (scenario_emergency): A high-stakes, time-critical scenario directly connected to the risk_context field. Requires immediate decision-making.

### Exam Milestone Placements (7 Exams)
- Exam 1: After Stage 8   (Early Orientation Check)
- Exam 2: After Stage 16  (Foundation Completion)
- Exam 3: After Stage 24  (Competency Verification)
- Exam 4: After Stage 32  (Mid-Program Assessment)
- Exam 5: After Stage 40  (Advanced Entry Gate)
- Exam 6: After Stage 52  (Pre-Mastery Benchmark)
- Exam 7: After Stage 60  (Final Certification Exam)

Questions per exam: 15, 20, 20, 25, 25, 30, 40 respectively.
Passing scores: 70%, 72%, 74%, 76%, 78%, 80%, 85% respectively.

## STRICT OUTPUT SCHEMA

Output ONLY a single, valid JSON object. No markdown fences, no explanatory text before or after. Begin with { and end with }.

The JSON must conform exactly to this TypeScript interface:

\`\`\`typescript
interface Output {
  stages: Array<{
    id: number;              // 1–60
    title_en: string;        // English title (5–10 words)
    title_ar: string;        // Arabic title (formal MSA)
    title_ku: string;        // Kurdish Sorani title
    scenario_operational: string;  // 2–4 sentences
    scenario_growth: string;       // 2–4 sentences
    scenario_dispute: string;      // 2–4 sentences
    scenario_emergency: string;    // 2–4 sentences
    focus_area: string;      // Exactly one of the 5 focus areas listed above
    risk_context: string;    // Exactly one of the 5 risks listed above
  }>;
  exams: Array<{
    id: number;              // 1–7
    title_en: string;        // English exam title
    title_ar: string;        // Arabic exam title
    title_ku: string;        // Kurdish Sorani exam title
    questions_count: number; // As specified in milestone placements
    passing_score: number;   // As percentage (e.g., 70 for 70%)
  }>;
}
\`\`\`

## VALIDATION CHECKLIST (self-verify before outputting)
□ stages array has exactly 60 objects
□ exams array has exactly 7 objects
□ Every stage has all 10 required fields
□ Every exam has all 6 required fields
□ No field is null, undefined, or an empty string
□ Focus areas are distributed across all 60 stages (not repeated consecutively more than 3 times)
□ Arabic and Kurdish titles are fully written (not transliterated English)
□ All stage IDs are unique integers 1–60
□ All exam IDs are unique integers 1–7
□ JSON is syntactically valid (no trailing commas, no comments inside JSON)

BEGIN OUTPUT NOW:`;
}
