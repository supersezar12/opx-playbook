/**
 * OPX PDF Export Engine — generates a print-optimised HTML page,
 * opens it in a new window, and triggers window.print() so the browser's
 * native PDF dialog handles rendering. Zero external libraries needed.
 *
 * The output is a fully self-contained HTML document with:
 *   - @page / @media print CSS for A4 layout
 *   - All 60 stage cards paginated with page-break-inside: avoid
 *   - 7 exam milestone cards
 *   - Bilingual (EN / AR / KU) titles
 *   - Colour-coded scenario type sections
 *   - Cover page with matrix metadata
 *   - Completion certificate page at the end
 */

import type { TrainingPayload, AppConfig, ExportOptions } from '../types';
import { DEPARTMENTS_DATA } from '../data/departments';

export function buildPdfHtml(
  payload: TrainingPayload,
  config: AppConfig,
  options: ExportOptions
): string {
  const title = options.matrixTitle || `${config.jobTitle} - ${config.industry} Training Matrix`;
  const date = new Date().toLocaleDateString('en-GB', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  // Resolve department
  const deptData = DEPARTMENTS_DATA
    .find(d => d.industry === config.industry)?.departments
    .find(d => d.id === config.department) ?? null;

  const seniorityLabel: Record<string, string> = {
    entry: 'Entry-Level / Operator',
    junior: 'Junior Management / Supervisor',
    senior: 'Senior Management / Executive',
  };

  function esc(s: string): string {
    return String(s ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  const stagePagesHtml = payload.stages.map(stage => `
  <div class="stage-card">
    <div class="stage-header">
      <div class="stage-num">Stage ${stage.id}</div>
      <div class="stage-titles">
        <div class="title-en">${esc(stage.title_en)}</div>
        <div class="title-ar" dir="rtl">${esc(stage.title_ar)}</div>
        <div class="title-ku" dir="rtl">${esc(stage.title_ku)}</div>
      </div>
      <div class="tags">
        <span class="tag tag-focus">⚡ ${esc(stage.focus_area)}</span>
        <span class="tag tag-risk">⚠ ${esc(stage.risk_context)}</span>
      </div>
    </div>
    <div class="scenarios">
      <div class="scenario op">
        <div class="scenario-label">⚙ Operational</div>
        <p>${esc(stage.scenario_operational)}</p>
      </div>
      <div class="scenario gr">
        <div class="scenario-label">💼 Growth</div>
        <p>${esc(stage.scenario_growth)}</p>
      </div>
      <div class="scenario di">
        <div class="scenario-label">⚖ Dispute</div>
        <p>${esc(stage.scenario_dispute)}</p>
      </div>
      <div class="scenario em">
        <div class="scenario-label">🚨 Emergency</div>
        <p>${esc(stage.scenario_emergency)}</p>
      </div>
    </div>
  </div>`).join('\n');

  const examCardsHtml = payload.exams.map(exam => `
  <div class="exam-card">
    <div class="exam-num">Exam ${exam.id}</div>
    <div class="exam-body">
      <div class="exam-title-en">${esc(exam.title_en)}</div>
      <div class="exam-title-ar" dir="rtl">${esc(exam.title_ar)}</div>
      <div class="exam-title-ku" dir="rtl">${esc(exam.title_ku)}</div>
      <div class="exam-meta">
        <span>📝 ${exam.questions_count} Questions</span>
        <span>✅ Pass: ${exam.passing_score}%</span>
      </div>
    </div>
  </div>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${esc(title)} — PDF</title>
<style>
  /* ─── Page Setup ─────────────────────────────────── */
  @page {
    size: A4 portrait;
    margin: 18mm 15mm 18mm 15mm;
    @bottom-center {
      content: "OPX Playbook Builder  ·  " counter(page) " / " counter(pages);
      font-size: 8pt; color: #94a3b8;
    }
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
    font-size: 9pt;
    color: #1e293b;
    background: #fff;
    line-height: 1.5;
  }

  /* ─── Cover Page ─────────────────────────────────── */
  .cover {
    page-break-after: always;
    min-height: 240mm;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 20mm;
    background: linear-gradient(160deg, #1e3a5f 0%, #2563eb 100%);
    color: white;
    border-radius: 8px;
  }
  .cover-logo { font-size: 48pt; margin-bottom: 10mm; }
  .cover-title { font-size: 20pt; font-weight: 800; letter-spacing: -0.02em; line-height: 1.2; margin-bottom: 6mm; }
  .cover-sub { font-size: 11pt; opacity: 0.8; margin-bottom: 10mm; }
  .cover-pills { display: flex; flex-wrap: wrap; gap: 3mm; justify-content: center; }
  .cover-pill { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 999px; padding: 1.5mm 5mm; font-size: 8.5pt; }
  .cover-date { margin-top: 15mm; font-size: 8pt; opacity: 0.6; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 5mm; }

  /* ─── Section Heading ────────────────────────────── */
  .section-heading {
    font-size: 13pt;
    font-weight: 700;
    color: #1e3a5f;
    border-bottom: 2px solid #2563eb;
    padding-bottom: 2mm;
    margin: 8mm 0 5mm;
    page-break-after: avoid;
  }

  /* ─── Stage Card ─────────────────────────────────── */
  .stage-card {
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    margin-bottom: 6mm;
    page-break-inside: avoid;
    overflow: hidden;
  }
  .stage-header {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    padding: 3mm 4mm;
    display: flex;
    flex-direction: column;
    gap: 1.5mm;
  }
  .stage-num {
    font-size: 7pt;
    font-weight: 700;
    color: #2563eb;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 4px;
    padding: 0.5mm 2mm;
    display: inline-block;
    width: fit-content;
  }
  .title-en { font-size: 10pt; font-weight: 700; color: #0f172a; }
  .title-ar { font-size: 9.5pt; color: #374151; font-style: italic; }
  .title-ku { font-size: 9.5pt; color: #374151; font-style: italic; }
  .tags { display: flex; flex-wrap: wrap; gap: 2mm; margin-top: 1mm; }
  .tag { padding: 0.5mm 2.5mm; border-radius: 999px; font-size: 7pt; font-weight: 600; }
  .tag-focus { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
  .tag-risk { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }

  /* ─── Scenarios ──────────────────────────────────── */
  .scenarios { display: grid; grid-template-columns: 1fr 1fr; }
  .scenario { padding: 2.5mm 3.5mm; border-top: 1px solid #e2e8f0; }
  .scenario:nth-child(odd) { border-right: 1px solid #e2e8f0; }
  .scenario.op { border-left: 3px solid #059669; }
  .scenario.gr { border-left: 3px solid #2563eb; }
  .scenario.di { border-left: 3px solid #d97706; }
  .scenario.em { border-left: 3px solid #dc2626; }
  .scenario-label { font-size: 7pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 1mm; }
  .scenario.op .scenario-label { color: #059669; }
  .scenario.gr .scenario-label { color: #2563eb; }
  .scenario.di .scenario-label { color: #d97706; }
  .scenario.em .scenario-label { color: #dc2626; }
  .scenario p { font-size: 8pt; color: #374151; line-height: 1.55; }

  /* ─── Exam Cards ─────────────────────────────────── */
  .exam-card {
    border: 2px solid #bfdbfe;
    border-radius: 6px;
    background: #eff6ff;
    padding: 4mm 5mm;
    margin-bottom: 4mm;
    display: flex;
    gap: 4mm;
    align-items: flex-start;
    page-break-inside: avoid;
  }
  .exam-num {
    font-size: 7.5pt;
    font-weight: 800;
    color: #2563eb;
    background: #dbeafe;
    border: 1px solid #93c5fd;
    border-radius: 4px;
    padding: 1mm 3mm;
    white-space: nowrap;
    flex-shrink: 0;
    margin-top: 0.5mm;
  }
  .exam-title-en { font-size: 10pt; font-weight: 700; }
  .exam-title-ar, .exam-title-ku { font-size: 9pt; color: #374151; font-style: italic; }
  .exam-meta { display: flex; gap: 6mm; margin-top: 2mm; font-size: 8pt; color: #1e40af; font-weight: 600; }

  /* ─── Certificate Page ───────────────────────────── */
  .cert-page {
    page-break-before: always;
    min-height: 220mm;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 15mm;
    border: 3mm solid #2563eb;
    border-radius: 8px;
    margin-top: 10mm;
  }
  .cert-icon { font-size: 36pt; margin-bottom: 6mm; }
  .cert-heading { font-size: 18pt; font-weight: 800; color: #1e3a5f; margin-bottom: 4mm; }
  .cert-body { font-size: 10pt; color: #374151; line-height: 1.8; max-width: 140mm; margin: 0 auto; }
  .cert-title-box {
    margin: 8mm 0;
    border: 1px solid #2563eb;
    border-radius: 6px;
    padding: 4mm 10mm;
    background: #eff6ff;
  }
  .cert-title-box p { font-size: 12pt; font-weight: 700; color: #1e3a5f; }
  .cert-title-box small { font-size: 8pt; color: #64748b; }
  .cert-footer { font-size: 8pt; color: #94a3b8; margin-top: 10mm; border-top: 1px solid #e2e8f0; padding-top: 4mm; }

  /* ─── Print overrides ────────────────────────────── */
  @media print {
    .cover { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .stage-card { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .exam-card { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .cert-page { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
  @media screen {
    body { padding: 20px; max-width: 900px; margin: 0 auto; background: #f1f5f9; }
    .cover { min-height: auto; padding: 40px; }
    .print-btn {
      position: fixed; bottom: 24px; right: 24px;
      background: #2563eb; color: white;
      border: none; border-radius: 12px;
      padding: 12px 24px; font-size: 15px; font-weight: 700;
      cursor: pointer; box-shadow: 0 4px 20px rgba(37,99,235,0.4);
      z-index: 999;
    }
    .print-btn:hover { background: #1d4ed8; }
    .print-btn-hint { position: fixed; bottom: 72px; right: 24px; font-size: 11px; color: #64748b; text-align: right; }
  }
</style>
</head>
<body>

<button class="print-btn" onclick="window.print()">🖨 Save as PDF</button>
<p class="print-btn-hint">Use "Save as PDF" in<br>your browser's print dialog</p>

<!-- ─── Cover Page ─────────────────────────────── -->
<div class="cover">
  <div class="cover-logo">📘</div>
  <div class="cover-title">${esc(title)}</div>
  <div class="cover-sub">Progressive Bilingual Corporate Training Matrix<br>Arabic (العربية) · Kurdish (کوردی) · English</div>
  <div class="cover-pills">
    <span class="cover-pill">🏭 ${esc(config.industry)}</span>
    ${deptData ? `<span class="cover-pill">${esc(deptData.emoji)} ${esc(deptData.name)}</span>` : ''}
    <span class="cover-pill">👤 ${esc(config.jobTitle)}</span>
    <span class="cover-pill">📊 ${esc(seniorityLabel[config.seniorityId] ?? config.seniorityId)}</span>
    <span class="cover-pill">📚 ${payload.stages.length} Stages · ${payload.exams.length} Exams</span>
  </div>
  <div class="cover-date">Generated: ${date} · OPX Playbook Builder</div>
</div>

<!-- ─── Training Stages ────────────────────────── -->
<div class="section-heading">⚙ Training Stages (${payload.stages.length})</div>
${stagePagesHtml}

<!-- ─── Milestone Examinations ────────────────── -->
<div class="section-heading">📋 Milestone Examinations (${payload.exams.length})</div>
${examCardsHtml}

<!-- ─── Certificate ───────────────────────────── -->
<div class="cert-page">
  <div class="cert-icon">🏆</div>
  <div class="cert-heading">Certificate of Completion</div>
  <div class="cert-body">
    Upon successfully completing all ${payload.stages.length} progressive training stages and passing all ${payload.exams.length} milestone examinations, the participant is awarded the following certification:
  </div>
  <div class="cert-title-box">
    <p>${esc(title)}</p>
    <small>OPX Playbook Builder · Certified Bilingual Training Matrix</small>
  </div>
  <div class="cert-body">
    Industry: <strong>${esc(config.industry)}</strong><br>
    ${deptData ? `Department: <strong>${esc(deptData.emoji)} ${esc(deptData.name)}</strong><br>` : ''}
    Role: <strong>${esc(config.jobTitle)}</strong><br>
    Seniority: <strong>${esc(seniorityLabel[config.seniorityId] ?? config.seniorityId)}</strong>
  </div>
  <div class="cert-footer">Generated: ${date} · This document is produced by OPX Playbook Builder</div>
</div>

<script>
  // Auto-trigger print on load so user can immediately save as PDF
  window.addEventListener('load', function() {
    // Small delay so browser renders fully
    setTimeout(() => {
      // Don't auto-print — show the page first so user can review
      // User clicks "Save as PDF" button when ready
    }, 500);
  });
<\/script>
</body>
</html>`;
}

/** Open the PDF view in a new window and trigger the browser print dialog. */
export function exportAsPdf(
  payload: TrainingPayload,
  config: AppConfig,
  options: ExportOptions
): void {
  const html = buildPdfHtml(payload, config, options);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    throw new Error(
      'Popup blocked. Please allow popups for this site, then try again.'
    );
  }
  // Clean up blob URL after the new window loads
  win.addEventListener('load', () => {
    URL.revokeObjectURL(url);
  });
}
