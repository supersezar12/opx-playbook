import type { TrainingPayload, ExportOptions, AppConfig } from '../types';

export function buildHtmlExport(
  payload: TrainingPayload,
  config: AppConfig,
  options: ExportOptions
): string {
  const payloadJson = JSON.stringify(payload, null, 2);
  const title = options.matrixTitle || `${config.jobTitle} - ${config.industry} Training Matrix`;

  const antiCopyScript = options.antiCopy
    ? `
  <script>
    // Anti-Copy Protection
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('selectstart', e => e.preventDefault());
    document.addEventListener('copy', e => e.preventDefault());
    document.addEventListener('keydown', function(e) {
      // Block Ctrl+U (view source), Ctrl+S (save), Ctrl+A (select all), Ctrl+C (copy)
      if (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S' || e.key === 'a' || e.key === 'A' || e.key === 'c' || e.key === 'C')) {
        e.preventDefault(); return false;
      }
      // Block F12 (DevTools)
      if (e.key === 'F12') { e.preventDefault(); return false; }
      // Block Ctrl+Shift+I and Ctrl+Shift+J (DevTools)
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) {
        e.preventDefault(); return false;
      }
    });
    // Blur on DevTools detection
    let devtoolsOpen = false;
    const threshold = 160;
    setInterval(() => {
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      if ((widthDiff || heightDiff) && !devtoolsOpen) {
        devtoolsOpen = true;
        document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;font-size:24px;color:#ef4444;">⛔ Developer tools detected. Content is protected.</div>';
      }
    }, 1000);
  <\/script>`
    : '';

  const langToggleScript = options.bilingualToggle
    ? `
  <script>
    let currentLang = 'en';
    function setLang(lang) {
      currentLang = lang;
      document.querySelectorAll('[data-lang]').forEach(el => {
        el.style.display = el.dataset.lang === lang ? '' : 'none';
      });
      document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.target === lang);
      });
    }
    document.addEventListener('DOMContentLoaded', () => setLang('en'));
  <\/script>`
    : '';

  const langToggleUI = options.bilingualToggle
    ? `
    <div class="lang-switcher">
      <button class="lang-btn active" data-target="en" onclick="setLang('en')">English</button>
      <button class="lang-btn" data-target="ar" onclick="setLang('ar')">العربية</button>
      <button class="lang-btn" data-target="ku" onclick="setLang('ku')">کوردی</button>
    </div>`
    : '';

  const wrapLang = (en: string, ar: string, ku: string) =>
    options.bilingualToggle
      ? `<span data-lang="en">${escHtml(en)}</span><span data-lang="ar" style="display:none" dir="rtl">${escHtml(ar)}</span><span data-lang="ku" style="display:none" dir="rtl">${escHtml(ku)}</span>`
      : escHtml(en);

  // Build progress tracker
  const progressDots = payload.stages
    .map(
      (s, i) =>
        `<div class="prog-dot" title="Stage ${i + 1}: ${escHtml(s.title_en)}" onclick="scrollToStage(${i + 1})"></div>`
    )
    .join('');

  // Build stage cards
  const stageCards = payload.stages
    .map(stage => `
    <div class="stage-card" id="stage-${stage.id}">
      <div class="stage-header">
        <span class="stage-id">Stage ${stage.id}</span>
        <div class="stage-title">${wrapLang(stage.title_en, stage.title_ar, stage.title_ku)}</div>
        <div class="stage-meta">
          <span class="tag tag-focus">⚡ ${escHtml(stage.focus_area)}</span>
          <span class="tag tag-risk">⚠️ ${escHtml(stage.risk_context)}</span>
        </div>
      </div>
      <div class="scenarios">
        <div class="scenario op">
          <div class="scenario-label">⚙️ Operational</div>
          <p>${escHtml(stage.scenario_operational)}</p>
        </div>
        <div class="scenario gr">
          <div class="scenario-label">💼 Growth</div>
          <p>${escHtml(stage.scenario_growth)}</p>
        </div>
        <div class="scenario di">
          <div class="scenario-label">⚖️ Dispute</div>
          <p>${escHtml(stage.scenario_dispute)}</p>
        </div>
        <div class="scenario em">
          <div class="scenario-label">🚨 Emergency</div>
          <p>${escHtml(stage.scenario_emergency)}</p>
        </div>
      </div>
    </div>`)
    .join('\n');

  // Build exam cards
  const examCards = payload.exams
    .map(exam => `
    <div class="exam-card" id="exam-${exam.id}">
      <div class="exam-icon">📋</div>
      <div class="exam-body">
        <div class="exam-title">${wrapLang(exam.title_en, exam.title_ar, exam.title_ku)}</div>
        <div class="exam-meta">
          <span>📝 ${exam.questions_count} Questions</span>
          <span>✅ ${exam.passing_score}% to Pass</span>
        </div>
      </div>
    </div>`)
    .join('\n');

  const generatedDate = new Date().toLocaleDateString('en-GB', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="generator" content="OPX Playbook Builder">
  <meta name="industry" content="${escHtml(config.industry)}">
  <meta name="role" content="${escHtml(config.jobTitle)}">
  <title>${escHtml(title)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --op: #059669; --gr: #2563eb; --di: #d97706; --em: #dc2626;
      --bg: #f8fafc; --card: #ffffff; --text: #0f172a; --muted: #64748b;
      --border: #e2e8f0; --accent: #3b82f6;
    }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; ${options.antiCopy ? 'user-select: none; -webkit-user-select: none;' : ''} }
    header { background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); color: white; padding: 2rem 1.5rem; text-align: center; }
    header h1 { font-size: clamp(1.4rem, 4vw, 2.2rem); font-weight: 800; letter-spacing: -0.02em; }
    header p { color: rgba(255,255,255,0.8); margin-top: 0.5rem; font-size: 0.95rem; }
    .meta-bar { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; margin-top: 1.2rem; }
    .meta-pill { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); border-radius: 999px; padding: 0.3rem 1rem; font-size: 0.8rem; }
    .lang-switcher { display: flex; gap: 0.5rem; justify-content: center; margin-top: 1.2rem; }
    .lang-btn { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.4); color: white; padding: 0.35rem 1.2rem; border-radius: 999px; cursor: pointer; font-size: 0.85rem; transition: all 0.2s; }
    .lang-btn.active { background: white; color: #1e3a5f; font-weight: 600; }
    .lang-btn:hover:not(.active) { background: rgba(255,255,255,0.25); }
    .container { max-width: 960px; margin: 0 auto; padding: 2rem 1rem; }
    .progress-section { background: var(--card); border: 1px solid var(--border); border-radius: 1rem; padding: 1.5rem; margin-bottom: 2rem; }
    .progress-section h2 { font-size: 0.9rem; font-weight: 600; color: var(--muted); margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .prog-grid { display: flex; flex-wrap: wrap; gap: 4px; }
    .prog-dot { width: 14px; height: 14px; border-radius: 3px; background: var(--accent); cursor: pointer; transition: transform 0.15s; opacity: 0.7; }
    .prog-dot:hover { transform: scale(1.4); opacity: 1; }
    .section-title { font-size: 1.3rem; font-weight: 700; margin: 2rem 0 1rem; display: flex; align-items: center; gap: 0.5rem; }
    .stage-card { background: var(--card); border: 1px solid var(--border); border-radius: 1rem; margin-bottom: 1.25rem; overflow: hidden; }
    .stage-header { padding: 1.2rem 1.5rem; border-bottom: 1px solid var(--border); display: flex; align-items: flex-start; flex-wrap: wrap; gap: 0.75rem; }
    .stage-id { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; border-radius: 0.5rem; padding: 0.2rem 0.6rem; font-size: 0.78rem; font-weight: 700; white-space: nowrap; }
    .stage-title { font-size: 1.05rem; font-weight: 600; flex: 1; min-width: 200px; }
    .stage-meta { display: flex; flex-wrap: wrap; gap: 0.5rem; width: 100%; }
    .tag { padding: 0.2rem 0.7rem; border-radius: 999px; font-size: 0.75rem; font-weight: 500; }
    .tag-focus { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
    .tag-risk { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }
    .scenarios { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    .scenario { padding: 1rem 1.2rem; border-top: 1px solid var(--border); }
    .scenario + .scenario { border-left: 1px solid var(--border); }
    @media (max-width: 640px) { .scenario + .scenario { border-left: none; } }
    .scenario.op { border-left: 4px solid var(--op); }
    .scenario.gr { border-left: 4px solid var(--gr); }
    .scenario.di { border-left: 4px solid var(--di); }
    .scenario.em { border-left: 4px solid var(--em); }
    .scenario-label { font-size: 0.78rem; font-weight: 700; margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); }
    .scenario.op .scenario-label { color: var(--op); }
    .scenario.gr .scenario-label { color: var(--gr); }
    .scenario.di .scenario-label { color: var(--di); }
    .scenario.em .scenario-label { color: var(--em); }
    .scenario p { font-size: 0.87rem; line-height: 1.6; color: #374151; }
    .exam-card { background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%); border: 2px solid #bfdbfe; border-radius: 1rem; padding: 1.5rem; margin-bottom: 1.25rem; display: flex; gap: 1rem; align-items: center; }
    .exam-icon { font-size: 2rem; flex-shrink: 0; }
    .exam-title { font-size: 1.05rem; font-weight: 700; }
    .exam-meta { display: flex; gap: 1.5rem; margin-top: 0.5rem; font-size: 0.85rem; color: var(--muted); }
    .cert-section { background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); color: white; border-radius: 1rem; padding: 3rem 2rem; text-align: center; margin-top: 3rem; }
    .cert-section h2 { font-size: 1.8rem; font-weight: 800; }
    .cert-section p { color: rgba(255,255,255,0.8); margin-top: 0.75rem; }
    .cert-badge { display: inline-block; background: rgba(255,255,255,0.15); border: 2px solid rgba(255,255,255,0.4); border-radius: 1rem; padding: 1.2rem 2.5rem; margin-top: 1.5rem; }
    .cert-badge .cert-title { font-size: 1.1rem; font-weight: 700; }
    .cert-badge .cert-sub { font-size: 0.85rem; opacity: 0.8; margin-top: 0.25rem; }
    footer { text-align: center; padding: 2rem; color: var(--muted); font-size: 0.8rem; border-top: 1px solid var(--border); }
    @media print { .lang-switcher { display: none; } }
  </style>
  ${langToggleScript}
</head>
<body>

<header>
  <h1>🎓 ${escHtml(title)}</h1>
  <p>A Progressive Bilingual Training Matrix — Arabic &amp; Kurdish</p>
  <div class="meta-bar">
    <span class="meta-pill">🏭 ${escHtml(config.industry)}</span>
    <span class="meta-pill">👤 ${escHtml(config.jobTitle)}</span>
    <span class="meta-pill">📊 ${escHtml(config.seniorityId)}</span>
    <span class="meta-pill">📅 ${generatedDate}</span>
    <span class="meta-pill">📚 60 Stages • 7 Exams</span>
  </div>
  ${langToggleUI}
</header>

<div class="container">

  <!-- Progress Tracker -->
  <div class="progress-section">
    <h2>📍 Stage Progress Tracker (Click to navigate)</h2>
    <div class="prog-grid">
      ${progressDots}
    </div>
  </div>

  <!-- Stages -->
  <div class="section-title">⚙️ Training Stages (60)</div>
  ${stageCards}

  <!-- Exams -->
  <div class="section-title">📋 Milestone Examinations (7)</div>
  ${examCards}

  <!-- Completion Certificate -->
  <div class="cert-section">
    <h2>🏆 Completion Certificate</h2>
    <p>Upon successful completion of all 60 stages and passing all 7 milestone examinations,<br>the participant is awarded the following certification:</p>
    <div class="cert-badge">
      <div class="cert-title">${escHtml(title)}</div>
      <div class="cert-sub">OPX Playbook Builder — Certified Training Matrix</div>
      <div class="cert-sub" style="margin-top:0.5rem;">Generated: ${generatedDate}</div>
    </div>
  </div>

</div>

<footer>
  Generated by OPX Playbook Builder &nbsp;|&nbsp; ${escHtml(config.industry)} Industry &nbsp;|&nbsp; ${generatedDate}
</footer>

<script>
  // Embedded payload (for potential extension)
  const OPX_PAYLOAD = ${payloadJson};

  function scrollToStage(id) {
    const el = document.getElementById('stage-' + id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
<\/script>
${antiCopyScript}
</body>
</html>`;
}

function escHtml(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
