import { INDUSTRIES_DATA }       from '../data/industries';
import { DEPARTMENTS_DATA }      from '../data/departments';
import { SENIORITY_LEVELS }      from '../data/seniority';
import { PRODUCT_CATEGORIES_DATA } from '../data/productCategories';
import type { AppConfig }        from '../types';

export function buildExecutionPrompt(config: AppConfig): string {
  const industryData  = INDUSTRIES_DATA.find(i => i.industry === config.industry);
  const seniorityData = SENIORITY_LEVELS.find(s => s.id === config.seniorityId);

  if (!industryData || !seniorityData) return '';

  // ── Resolve department ────────────────────────────────────────────────────
  const industryDepts = DEPARTMENTS_DATA.find(d => d.industry === config.industry)?.departments ?? [];
  const deptData      = industryDepts.find(d => d.id === config.department) ?? null;

  // ── Resolve product categories (Distribution Company only) ────────────────
  const selectedCats = (config.productCategories ?? [])
    .map(id => PRODUCT_CATEGORIES_DATA.find(c => c.id === id))
    .filter((c): c is NonNullable<typeof c> => !!c);

  // ── Build sections ────────────────────────────────────────────────────────
  const focuses = industryData.focuses.map((f, i) => `  ${i + 1}. ${f}`).join('\n');
  const risks   = industryData.risks.map((r, i)   => `  ${i + 1}. ${r}`).join('\n');

  const departmentSection = deptData
    ? `
## DEPARTMENT CONTEXT (Priority Injection)
The training must be scoped specifically to the **${deptData.name}** department
within the ${config.industry} industry. Every scenario must reflect the real
day-to-day reality of this department.

### Department-Specific Sub-Focuses
Weight your scenario writing heavily toward these sub-focuses:
${deptData.subFocuses.map((sf, i) => `  ${i + 1}. ${sf}`).join('\n')}

### Typical Roles in This Department
The trainee may hold one of these roles: ${deptData.typicalRoles.join(', ')}.
Calibrate language, responsibilities, and decision-making authority accordingly.

### Department + Industry Focus Mapping
Blend the department sub-focuses above with the broader industry focus areas.
Each stage must clearly connect to BOTH its assigned industry focus_area AND the
department's operational context.
`
    : '';

  const productCategorySection = selectedCats.length > 0
    ? `
## PRODUCT PORTFOLIO CONTEXT (Priority Injection — Distribution Company)
This distribution company handles the following product categories. Every
scenario must reflect the SPECIFIC handling requirements, risks, and workflows
of the relevant category for the trainee's role:

${selectedCats.map((cat, i) => `### ${i + 1}. ${cat.emoji} ${cat.name}
- Storage Temperature: ${cat.tempRange}
- Shelf Life / Urgency: ${cat.shelfLife}
- Handling Requirements: ${cat.handling}
- Category-Specific Risks: ${cat.keyRisks.join(', ')}
- Example SKUs: ${cat.examples.join(', ')}`).join('\n\n')}

When writing operational scenarios, reference these product categories directly
(e.g., temperature breach on a frozen delivery, FEFO violation on fresh produce,
damaged canned goods on GRN). Emergency scenarios must be plausible within the
context of the above categories' cold chain / handling requirements.
`
    : '';

  const policySection = config.policyText.trim()
    ? `
## COMPANY POLICY CONTEXT (Priority Injection)
The following raw company policy text must be referenced and embedded throughout
the curriculum where relevant. Align scenario content with these policies:

"""
${config.policyText.trim()}
"""
`
    : '';

  return `# OPX PLAYBOOK BUILDER — EXECUTION PROMPT
# Generated: ${new Date().toISOString()}
# ─────────────────────────────────────────────────────────────────────────────

## ROLE & OBJECTIVE
You are an expert corporate training curriculum architect. Your task is to
generate a complete, production-grade, bilingual (Arabic + Kurdish) progressive
training matrix. This output will be directly compiled into a client-facing
training platform, so precision, completeness, and schema compliance are
mandatory. No placeholders. No lorem ipsum. All content must be substantive,
realistic, and contextually accurate.

## TARGET PROFILE
- Industry:    ${config.industry}
- Department:  ${deptData ? deptData.name : 'Cross-functional (no specific department)'}
- Product Categories: ${selectedCats.length > 0 ? selectedCats.map(c => `${c.emoji} ${c.name}`).join(', ') : 'All / Not specified'}
- Job Title:   ${config.jobTitle}
- Seniority:   ${seniorityData.label}
- Tonal Frame: ${seniorityData.tone}
${departmentSection}
## INDUSTRY KNOWLEDGE BASE

### Core Focus Areas (embed throughout all 60 stages):
${focuses}

### Key Risk Factors (use as risk_context across stages):
${risks}
${productCategorySection}
${policySection}
## LANGUAGE REQUIREMENTS
1. All trilingual fields (title_en, title_ar, title_ku) must be fully written —
   not machine-transliterated.
2. Arabic: Use Modern Standard Arabic (فصحى), formal corporate register.
3. Kurdish: Use Sorani dialect (سۆرانی) as the primary target. If a term has
   no direct Sorani equivalent, provide Kurmanji with a note like "[Kurmanji]".
4. Scenario body text (scenario_operational, scenario_growth, scenario_dispute,
   scenario_emergency) must be written in English. Each scenario must be 2–4
   sentences describing a realistic, role-specific situation the trainee
   encounters in the ${deptData ? deptData.name + ' department' : config.industry + ' industry'}.

## CURRICULUM ARCHITECTURE

### Progressive Stage Design (60 Stages)
- Stages 01–12 (Foundation):   Core procedural skills, safety basics, role orientation
- Stages 13–24 (Competency):   Department-level workflows, KPI frameworks, compliance
- Stages 25–36 (Proficiency):  Cross-functional coordination, risk identification
- Stages 37–48 (Advanced):     Strategic alignment, escalation, stakeholder management
- Stages 49–60 (Mastery):      Enterprise leadership, crisis command, governance

### Focus Area Distribution
Distribute the 5 industry focus areas evenly across all 60 stages (12 stages
each). Assign each stage exactly ONE focus_area from the list above.
${deptData ? `
When writing scenario content for each focus_area, integrate the department
sub-focuses (${deptData.subFocuses.join('; ')}) so every stage is grounded in
the daily reality of the ${deptData.name} department.
` : ''}
### Scenario Type Definitions (4 per stage)
- ⚙️ Operational (scenario_operational):
  A day-to-day task, process execution, or procedural challenge the role
  encounters. Must reflect the stage's focus_area${deptData ? ` and the ${deptData.name} department context` : ''}.

- 💼 Growth (scenario_growth):
  A professional development challenge, improvement initiative, or
  capacity-building opportunity. Tone: ${seniorityData.tone}.

- ⚖️ Dispute (scenario_dispute):
  An interpersonal, inter-departmental, contractual, or ethical conflict
  requiring resolution. Reflect realistic friction points in the
  ${deptData ? deptData.name + ' department of the ' : ''}${config.industry} industry.

- 🚨 Emergency (scenario_emergency):
  A high-stakes, time-critical scenario directly connected to the risk_context
  field. Requires immediate decision-making. The risk must be plausible within
  ${deptData ? deptData.name + ' operations' : 'the industry'}.

### Exam Milestone Placements (7 Exams)
- Exam 1: After Stage 8  — Early Orientation Check         (15 Qs, 70% pass)
- Exam 2: After Stage 16 — Foundation Completion           (20 Qs, 72% pass)
- Exam 3: After Stage 24 — Competency Verification         (20 Qs, 74% pass)
- Exam 4: After Stage 32 — Mid-Program Assessment          (25 Qs, 76% pass)
- Exam 5: After Stage 40 — Advanced Entry Gate             (25 Qs, 78% pass)
- Exam 6: After Stage 52 — Pre-Mastery Benchmark           (30 Qs, 80% pass)
- Exam 7: After Stage 60 — Final Certification Exam        (40 Qs, 85% pass)

## STRICT OUTPUT SCHEMA

Output ONLY a single, valid JSON object. No markdown fences, no explanatory
text before or after. Begin with { and end with }.

The JSON must conform exactly to this TypeScript interface:

\`\`\`typescript
interface Output {
  stages: Array<{
    id: number;                    // 1–60
    title_en: string;              // English title (5–10 words)
    title_ar: string;              // Arabic title (formal MSA)
    title_ku: string;              // Kurdish Sorani title
    scenario_operational: string;  // 2–4 sentences
    scenario_growth: string;       // 2–4 sentences
    scenario_dispute: string;      // 2–4 sentences
    scenario_emergency: string;    // 2–4 sentences
    focus_area: string;            // Exactly one of the 5 industry focus areas
    risk_context: string;          // Exactly one of the 5 key risks
  }>;
  exams: Array<{
    id: number;              // 1–7
    title_en: string;
    title_ar: string;
    title_ku: string;
    questions_count: number;
    passing_score: number;   // percentage integer (e.g. 70 for 70%)
  }>;
}
\`\`\`

## VALIDATION CHECKLIST (self-verify before outputting)
□ stages array has exactly 60 objects
□ exams array has exactly 7 objects
□ Every stage has all 10 required fields with non-empty values
□ Every exam has all 6 required fields with non-empty values
□ Focus areas distributed across all 60 stages (not >3 consecutive repeats)
□ Arabic and Kurdish titles are fully written (not transliterated English)
□ All stage IDs are unique integers 1–60
□ All exam IDs are unique integers 1–7
□ JSON is syntactically valid (no trailing commas, no inline comments)
${deptData ? `□ All scenarios reflect the ${deptData.name} department context\n□ Department sub-focuses are embedded across scenarios` : ''}
${selectedCats.length > 0 ? `□ Product categories (${selectedCats.map(c => c.name).join(', ')}) are referenced in operational and emergency scenarios\n□ Temperature, shelf life, and handling requirements match each category's specifications` : ''}

BEGIN OUTPUT NOW:`;
}
