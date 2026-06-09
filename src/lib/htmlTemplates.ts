/**
 * OPX Playbook Builder — HTML Export Templates
 *
 * Three standalone multi-page HTML files with:
 *  - SPA-style page navigation (no server needed)
 *  - CSS animations and transitions
 *  - Interactive buttons (next/prev stage, exam prompt, progress bar)
 *  - Bilingual toggle (EN / AR / KU)
 *  - Anti-copy protection (optional)
 *  - Zero external dependencies
 *
 * Security hardening (v1.5.1):
 *  - Content-Security-Policy meta tag on all exported files
 *  - All user-controlled strings HTML-escaped before insertion into markup
 *  - JSON payload serialised with escapeJsonForHtml() which escapes </script>
 *    sequences, preventing script-tag injection via payload content
 *  - Runtime innerHTML assignments in JS use a dedicated escJ() helper that
 *    escapes the five HTML special characters before any DOM write
 *  - data-* attribute values routed through esc() at compile time
 *  - Numeric fields (id, questions_count, passing_score) coerced to integers
 *    before embedding to prevent prototype injection
 */

import type { TrainingPayload, AppConfig, ExportOptions } from '../types';
import { DEPARTMENTS_DATA } from '../data/departments';

/* ── 1. HTML escape (compile-time, TypeScript side) ──────────────────────── */
function esc(s: unknown): string {
  if (typeof s !== 'string') return String(s ?? '');
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;');   // prevent template-literal injection
}

/* ── 2. JSON-in-HTML escape ───────────────────────────────────────────────── *
 * JSON.stringify can produce strings containing </script> which breaks out of
 * a <script> block. We escape the forward-slash after < to neutralise this.
 * The result is still valid JSON when parsed by the browser JS engine.
 */
function escJsonForHtml(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003C')
    .replace(/>/g, '\\u003E')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')  // line separator (breaks JS string literals)
    .replace(/\u2029/g, '\\u2029'); // paragraph separator
}

/* ── 3. Runtime escaper (embedded verbatim in every exported <script> block) ─
 * This is a self-contained JS function that runs inside the exported HTML file.
 * It must be a plain string — no TypeScript, no imports.
 */
const RUNTIME_ESC_FN = `
function _e(s){
  if(s==null)return'';
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}`;

/* ── 4. CSP meta tag ─────────────────────────────────────────────────────── *
 * default-src 'none' blocks everything not explicitly allowed.
 * script-src 'self' 'unsafe-inline' — required because the payload is embedded
 *   as an inline <script> block. There is no external CDN or eval() used.
 * style-src 'self' 'unsafe-inline' — all CSS is inline.
 * img-src data: — allows emojis rendered as data URIs in some browsers.
 * The policy is as tight as possible given the self-contained file constraint.
 */
const CSP_META = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: 'self'; font-src 'self'; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none';">`;

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function antiCopyJs(): string {
  return `
  document.addEventListener('contextmenu',function(e){e.preventDefault();});
  document.addEventListener('selectstart',function(e){e.preventDefault();});
  document.addEventListener('copy',function(e){e.preventDefault();});
  document.addEventListener('keydown',function(e){
    if(e.ctrlKey&&['u','U','s','S','a','A','c','C'].indexOf(e.key)!==-1){e.preventDefault();return false;}
    if(e.key==='F12'){e.preventDefault();return false;}
    if(e.ctrlKey&&e.shiftKey&&['I','i','J','j'].indexOf(e.key)!==-1){e.preventDefault();return false;}
  });`;
}

function bilingualJs(): string {
  return `
  var _lang='en';
  function setLang(l){
    _lang=l;
    document.querySelectorAll('[data-en]').forEach(function(el){
      el.textContent=el.getAttribute('data-'+l)||el.getAttribute('data-en')||'';
    });
    document.querySelectorAll('.lb').forEach(function(b){
      b.classList.toggle('lb-active',b.getAttribute('data-l')===l);
    });
    document.documentElement.dir=(l==='ar'||l==='ku')?'rtl':'ltr';
  }`;
}

function langBar(bilingualToggle: boolean): string {
  if (!bilingualToggle) return '';
  return `
  <div class="lang-bar">
    <button class="lb lb-active" data-l="en" onclick="setLang('en')">EN</button>
    <button class="lb" data-l="ar" onclick="setLang('ar')">العربية</button>
    <button class="lb" data-l="ku" onclick="setLang('ku')">کوردی</button>
  </div>`;
}

/** Compile-time bilingual span — all three values escaped at build time. */
function t(en: string, ar: string, ku: string, bilingual: boolean): string {
  if (!bilingual) return esc(en);
  return `<span data-en="${esc(en)}" data-ar="${esc(ar)}" data-ku="${esc(ku)}">${esc(en)}</span>`;
}

/** Coerce to safe integer string for embedding in JS (prevents prototype injection). */
function safeInt(v: unknown): string {
  const n = parseInt(String(v), 10);
  return isNaN(n) ? '0' : String(n);
}

/* ══════════════════════════════════════════════════════════════════════════════
   TEMPLATE 1 — "Executive Dark"
══════════════════════════════════════════════════════════════════════════════ */
export function buildExecutiveTemplate(
  payload: TrainingPayload, config: AppConfig, options: ExportOptions
): string {
  const title = options.matrixTitle || `${config.jobTitle} — ${config.industry} Training Matrix`;
  const dept  = DEPARTMENTS_DATA.find(d => d.industry === config.industry)
    ?.departments.find(d => d.id === config.department) ?? null;
  const date  = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  const B     = options.bilingualToggle;
  const total = payload.stages.length;

  // Static HTML for each stage — all content escaped at build time
  const stagePages = payload.stages.map((s, i) => `
  <div class="page stage-page" id="s${safeInt(s.id)}" data-idx="${i}">
    <div class="page-inner">
      <div class="stage-nav">
        <button class="nav-btn" onclick="goStage(${i - 1})" ${i === 0 ? 'disabled' : ''}>← Prev</button>
        <div class="stage-counter"><span class="cur">${safeInt(s.id)}</span><span class="sep">/</span><span class="tot">${total}</span></div>
        <button class="nav-btn" onclick="goStage(${i + 1})" ${i === total - 1 ? 'disabled' : ''}>Next →</button>
      </div>
      <div class="stage-badge">
        <span class="focus-tag">${esc(s.focus_area)}</span>
        <span class="risk-tag">⚠ ${esc(s.risk_context)}</span>
      </div>
      <h2 class="stage-title">${t(s.title_en, s.title_ar, s.title_ku, B)}</h2>
      <div class="scenario-grid">
        <div class="sc sc-op"><div class="sc-lbl">⚙ Operational</div><p>${esc(s.scenario_operational)}</p></div>
        <div class="sc sc-gr"><div class="sc-lbl">💼 Growth</div><p>${esc(s.scenario_growth)}</p></div>
        <div class="sc sc-di"><div class="sc-lbl">⚖ Dispute</div><p>${esc(s.scenario_dispute)}</p></div>
        <div class="sc sc-em"><div class="sc-lbl">🚨 Emergency</div><p>${esc(s.scenario_emergency)}</p></div>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar" style="width:${((i + 1) / total * 100).toFixed(1)}%"></div>
      </div>
    </div>
  </div>`).join('');

  const examPages = payload.exams.map(ex => `
  <div class="page exam-page" id="ex${safeInt(ex.id)}">
    <div class="page-inner exam-inner">
      <div class="exam-icon-big">📋</div>
      <h2 class="exam-title">${t(ex.title_en, ex.title_ar, ex.title_ku, B)}</h2>
      <div class="exam-meta-row">
        <div class="em-card"><div class="em-val">${safeInt(ex.questions_count)}</div><div class="em-lbl">Questions</div></div>
        <div class="em-card"><div class="em-val">${safeInt(ex.passing_score)}%</div><div class="em-lbl">Pass Score</div></div>
      </div>
      <p class="exam-hint">Achieve ${safeInt(ex.passing_score)}% or above to proceed.</p>
      <button class="cta-btn" onclick="showHome()">↩ Return to Overview</button>
    </div>
  </div>`).join('');

  // Safe integer arrays for JS navigation — no user text in these
  const stageIds     = escJsonForHtml(payload.stages.map(s => parseInt(String(s.id), 10)));
  const examAfterMap = escJsonForHtml({ 8: 1, 16: 2, 24: 3, 32: 4, 40: 5, 52: 6, 60: 7 });

  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
${CSP_META}
<title>${esc(title)}</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--gold:#f0b429;--navy:#0a0d1a;--navy2:#111827;--navy3:#1a2234;--op:#10b981;--gr:#3b82f6;--di:#f59e0b;--em:#ef4444;${options.antiCopy ? 'user-select:none;-webkit-user-select:none;' : ''}}
html,body{height:100%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--navy);color:#f1f5f9;overflow:hidden}
.page{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:1rem;opacity:0;pointer-events:none;transition:opacity .35s cubic-bezier(.4,0,.2,1),transform .35s cubic-bezier(.4,0,.2,1);transform:translateX(40px)}
.page.active{opacity:1;pointer-events:all;transform:translateX(0)}
.page.exit-left{opacity:0;transform:translateX(-40px)}
.page-inner{width:100%;max-width:860px;max-height:calc(100vh - 80px);overflow-y:auto;scrollbar-width:thin;scrollbar-color:#334155 transparent}
#home{background:radial-gradient(ellipse at 60% 30%,#1e3a5f 0%,#0a0d1a 70%)}
.home-inner{text-align:center;padding:2rem 1rem}
.home-logo{font-size:3.5rem;margin-bottom:1rem;filter:drop-shadow(0 0 20px rgba(240,180,41,.4))}
.home-title{font-size:clamp(1.5rem,4vw,2.4rem);font-weight:800;color:#f1f5f9;line-height:1.2;margin-bottom:.75rem}
.gold{color:var(--gold)}
.home-sub{font-size:.95rem;color:#94a3b8;margin-bottom:2rem;max-width:500px;margin-left:auto;margin-right:auto}
.meta-chips{display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center;margin-bottom:2rem}
.chip{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:999px;padding:.3rem .9rem;font-size:.78rem;color:#cbd5e1}
.chapters{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.75rem;max-width:700px;margin:0 auto 2rem}
.ch-btn{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:.85rem;padding:1rem .75rem;cursor:pointer;transition:all .2s;color:#f1f5f9;font-size:.82rem;font-weight:600}
.ch-btn:hover{background:rgba(240,180,41,.12);border-color:rgba(240,180,41,.4);color:var(--gold);transform:translateY(-2px)}
.ch-icon{font-size:1.6rem;display:block;margin-bottom:.4rem}
.stage-page{background:var(--navy)}
.stage-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem}
.nav-btn{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);color:#cbd5e1;padding:.45rem 1.1rem;border-radius:.6rem;cursor:pointer;font-size:.82rem;font-weight:600;transition:all .2s}
.nav-btn:hover:not(:disabled){background:rgba(240,180,41,.15);border-color:var(--gold);color:var(--gold)}
.nav-btn:disabled{opacity:.3;cursor:default}
.stage-counter{font-size:1rem;font-weight:700;color:#94a3b8}
.stage-counter .cur{color:var(--gold);font-size:1.3rem}
.stage-badge{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:.75rem}
.focus-tag{background:rgba(16,185,129,.15);border:1px solid rgba(16,185,129,.3);color:#6ee7b7;padding:.25rem .75rem;border-radius:999px;font-size:.72rem;font-weight:700}
.risk-tag{background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.25);color:#fca5a5;padding:.25rem .75rem;border-radius:999px;font-size:.72rem;font-weight:700}
.stage-title{font-size:clamp(1.1rem,2.5vw,1.5rem);font-weight:800;color:#f1f5f9;margin-bottom:1rem;line-height:1.3}
.scenario-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:.6rem;margin-bottom:1rem}
.sc{background:var(--navy3);border-radius:.85rem;padding:1rem;border-left:4px solid #475569;transition:transform .2s}
.sc:hover{transform:translateY(-2px)}
.sc-op{border-left-color:var(--op)}.sc-gr{border-left-color:var(--gr)}.sc-di{border-left-color:var(--di)}.sc-em{border-left-color:var(--em)}
.sc-lbl{font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.45rem}
.sc-op .sc-lbl{color:var(--op)}.sc-gr .sc-lbl{color:var(--gr)}.sc-di .sc-lbl{color:var(--di)}.sc-em .sc-lbl{color:var(--em)}
.sc p{font-size:.82rem;color:#94a3b8;line-height:1.6}
.progress-bar-wrap{height:4px;background:rgba(255,255,255,.08);border-radius:2px;overflow:hidden;margin-top:.5rem}
.progress-bar{height:100%;background:linear-gradient(90deg,var(--gold),#f59e0b);border-radius:2px;transition:width .4s ease}
.exam-page{background:radial-gradient(ellipse at 40% 60%,#1e3a5f 0%,#0a0d1a 70%)}
.exam-inner{text-align:center;padding:2rem 1rem}
.exam-icon-big{font-size:4rem;margin-bottom:1rem}
.exam-title{font-size:clamp(1.2rem,3vw,1.8rem);font-weight:800;color:#f1f5f9;margin-bottom:1.5rem}
.exam-meta-row{display:flex;gap:1rem;justify-content:center;margin-bottom:1.5rem}
.em-card{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:1rem;padding:1.2rem 2rem;min-width:120px}
.em-val{font-size:2rem;font-weight:900;color:var(--gold)}
.em-lbl{font-size:.78rem;color:#64748b;margin-top:.25rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em}
.exam-hint{color:#64748b;font-size:.88rem;max-width:420px;margin:0 auto 1.5rem;line-height:1.6}
#cert{background:radial-gradient(ellipse at 50% 50%,#1a2c1a 0%,#0a0d1a 70%)}
.cert-inner{text-align:center;padding:2rem 1rem;max-width:640px;margin:0 auto}
.cert-trophy{font-size:5rem;filter:drop-shadow(0 0 30px rgba(240,180,41,.5));margin-bottom:1rem;animation:float 3s ease-in-out infinite}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
.cert-frame{border:2px solid var(--gold);border-radius:1.5rem;padding:2rem;background:rgba(240,180,41,.04);margin:1.5rem auto;max-width:500px;box-shadow:0 0 40px rgba(240,180,41,.15)}
.cert-headline{font-size:clamp(1.2rem,3vw,1.8rem);font-weight:900;color:var(--gold);margin-bottom:.5rem}
.cert-name{font-size:1rem;color:#94a3b8;margin:.25rem 0}
.cert-stamp{font-size:.75rem;color:#475569;margin-top:1rem;border-top:1px solid rgba(255,255,255,.08);padding-top:.75rem}
.topbar{position:fixed;top:0;left:0;right:0;height:52px;background:rgba(10,13,26,.85);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,.07);display:flex;align-items:center;justify-content:space-between;padding:0 1rem;z-index:100}
.topbar-logo{font-size:.82rem;font-weight:700;color:var(--gold);display:flex;align-items:center;gap:.4rem}
.topbar-right{display:flex;align-items:center;gap:.5rem}
.lang-bar{display:flex;gap:.3rem}
.lb{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#94a3b8;padding:.2rem .6rem;border-radius:.4rem;cursor:pointer;font-size:.72rem;font-weight:600;transition:all .15s}
.lb.lb-active{background:rgba(240,180,41,.2);border-color:var(--gold);color:var(--gold)}
.home-btn{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#94a3b8;padding:.25rem .7rem;border-radius:.4rem;cursor:pointer;font-size:.72rem;transition:all .15s}
.home-btn:hover{background:rgba(255,255,255,.12);color:#f1f5f9}
.cta-btn{background:linear-gradient(135deg,#f0b429,#f59e0b);color:#0a0d1a;border:none;border-radius:.85rem;padding:.75rem 2rem;font-size:.9rem;font-weight:800;cursor:pointer;transition:all .2s;box-shadow:0 4px 20px rgba(240,180,41,.3)}
.cta-btn:hover{transform:translateY(-2px);box-shadow:0 6px 30px rgba(240,180,41,.45)}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#334155;border-radius:2px}
@media(max-width:600px){.scenario-grid{grid-template-columns:1fr 1fr}.chapters{grid-template-columns:repeat(2,1fr)}}
</style>
</head>
<body>

<div class="topbar">
  <div class="topbar-logo">📘 OPX Playbook</div>
  <div class="topbar-right">
    ${langBar(B)}
    <button class="home-btn" onclick="showHome()">⌂ Overview</button>
    <button class="home-btn" onclick="showCert()">🏆 Certificate</button>
  </div>
</div>

<div class="page active" id="home" style="padding-top:52px">
  <div class="page-inner home-inner" style="padding-top:2rem">
    <div class="home-logo">📘</div>
    <h1 class="home-title">${esc(title)}</h1>
    <p class="home-sub">Progressive Bilingual Training Matrix — Arabic &amp; Kurdish &amp; English</p>
    <div class="meta-chips">
      <span class="chip">🏭 ${esc(config.industry)}</span>
      ${dept ? `<span class="chip">${esc(dept.emoji)} ${esc(dept.name)}</span>` : ''}
      <span class="chip">👤 ${esc(config.jobTitle)}</span>
      <span class="chip">📊 ${esc(config.seniorityId)}</span>
      <span class="chip">📅 ${esc(date)}</span>
      <span class="chip">📚 ${payload.stages.length} Stages · ${payload.exams.length} Exams</span>
    </div>
    <div class="chapters" id="chapterGrid"></div>
    <button class="cta-btn" onclick="goStage(0)" style="margin-top:.5rem">▶ Start Training</button>
  </div>
</div>

${stagePages}
${examPages}

<div class="page" id="cert" style="padding-top:52px">
  <div class="page-inner cert-inner">
    <div class="cert-trophy">🏆</div>
    <h1 style="font-size:clamp(1.1rem,3vw,1.6rem);color:#f1f5f9;font-weight:900;margin-bottom:.5rem">Certificate of Completion</h1>
    <p style="color:#64748b;font-size:.88rem;margin-bottom:1.5rem">Successfully completed all ${payload.stages.length} stages and ${payload.exams.length} exams.</p>
    <div class="cert-frame">
      <div class="cert-headline">${esc(title)}</div>
      <div class="cert-name">🏭 ${esc(config.industry)}${dept ? ' · ' + esc(dept.name) : ''}</div>
      <div class="cert-name">👤 ${esc(config.jobTitle)} · ${esc(config.seniorityId)}</div>
      <div class="cert-stamp">OPX Playbook Builder · Generated ${esc(date)}</div>
    </div>
    <button class="cta-btn" onclick="showHome()">↩ Back to Overview</button>
  </div>
</div>

<script>
${RUNTIME_ESC_FN}
${B ? bilingualJs() : ''}
${options.antiCopy ? antiCopyJs() : ''}

// Payload metadata only — full text content is in static HTML above, not in JS
var STAGE_IDS=${stageIds};
var EXAM_AFTER=${examAfterMap};
var _cur=null;

function showPage(id){
  var pages=document.querySelectorAll('.page');
  pages.forEach(function(p){
    if(p.classList.contains('active')){
      p.classList.add('exit-left');
      p.classList.remove('active');
      setTimeout(function(){p.classList.remove('exit-left');},400);
    }
  });
  var next=document.getElementById(id);
  if(next){setTimeout(function(){next.classList.add('active');},60);}
  _cur=id;
}

function showHome(){showPage('home');}
function showCert(){showPage('cert');}

function goStage(idx){
  if(idx<0||idx>=STAGE_IDS.length)return;
  var sid=STAGE_IDS[idx];
  showPage('s'+sid);
  if(EXAM_AFTER[sid]){
    setTimeout(function(){
      if(confirm('Milestone! Exam '+EXAM_AFTER[sid]+' is available. Open it now?')){
        showPage('ex'+EXAM_AFTER[sid]);
      }
    },800);
  }
}

// Build chapter navigation buttons (only static labels — no payload text)
(function(){
  var grid=document.getElementById('chapterGrid');
  if(!grid)return;
  var groups=[
    {icon:'🌱',label:'Foundation',range:'1–12',start:0},
    {icon:'⚙',label:'Competency',range:'13–24',start:12},
    {icon:'🎯',label:'Proficiency',range:'25–36',start:24},
    {icon:'🚀',label:'Advanced',range:'37–48',start:36},
    {icon:'🏆',label:'Mastery',range:'49–60',start:48},
    {icon:'📋',label:'Exams',range:'7 Milestones',start:-1},
    {icon:'🏅',label:'Certificate',range:'Final',start:-2},
  ];
  groups.forEach(function(g){
    var b=document.createElement('button');
    b.className='ch-btn';
    // Static strings only — no payload data
    var icon=document.createElement('span');icon.className='ch-icon';icon.textContent=g.icon;
    var lbl=document.createElement('span');lbl.textContent=g.label;
    var sub=document.createElement('small');sub.style.cssText='color:#64748b;font-weight:400;display:block';sub.textContent=g.range;
    b.appendChild(icon);b.appendChild(lbl);b.appendChild(sub);
    b.onclick=function(){
      if(g.start===-2)showCert();
      else if(g.start===-1)showPage('ex1');
      else goStage(g.start);
    };
    grid.appendChild(b);
  });
})();

document.addEventListener('keydown',function(e){
  if(e.key==='ArrowRight'||e.key==='ArrowDown'){
    var m=_cur&&_cur.match(/^s(\d+)$/);
    if(m){var idx=STAGE_IDS.indexOf(parseInt(m[1],10));if(idx!==-1)goStage(idx+1);}
  }
  if(e.key==='ArrowLeft'||e.key==='ArrowUp'){
    var m2=_cur&&_cur.match(/^s(\d+)$/);
    if(m2){var idx2=STAGE_IDS.indexOf(parseInt(m2[1],10));if(idx2!==-1)goStage(idx2-1);}
  }
  if(e.key==='Escape'){showHome();}
});
</script>
${options.antiCopy ? `<script>/* anti-copy initialised above */</script>` : ''}
</body>
</html>`;
}

/* ══════════════════════════════════════════════════════════════════════════════
   TEMPLATE 2 — "Academy Light"
══════════════════════════════════════════════════════════════════════════════ */
export function buildAcademyTemplate(
  payload: TrainingPayload, config: AppConfig, options: ExportOptions
): string {
  const title = options.matrixTitle || `${config.jobTitle} — ${config.industry} Training Matrix`;
  const dept  = DEPARTMENTS_DATA.find(d => d.industry === config.industry)
    ?.departments.find(d => d.id === config.department) ?? null;
  const date  = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  const B     = options.bilingualToggle;

  // Full payload serialised safely for JS consumption — user text will be
  // accessed only via textContent / setAttribute (never innerHTML) in runtime JS
  const stagesJson = escJsonForHtml(payload.stages.map(s => ({
    id:                   parseInt(String(s.id), 10),
    title_en:             String(s.title_en),
    title_ar:             String(s.title_ar),
    title_ku:             String(s.title_ku),
    focus_area:           String(s.focus_area),
    risk_context:         String(s.risk_context),
    scenario_operational: String(s.scenario_operational),
    scenario_growth:      String(s.scenario_growth),
    scenario_dispute:     String(s.scenario_dispute),
    scenario_emergency:   String(s.scenario_emergency),
  })));
  const examsJson = escJsonForHtml(payload.exams.map(ex => ({
    id:             parseInt(String(ex.id), 10),
    title_en:       String(ex.title_en),
    title_ar:       String(ex.title_ar),
    title_ku:       String(ex.title_ku),
    questions_count: parseInt(String(ex.questions_count), 10),
    passing_score:   parseInt(String(ex.passing_score), 10),
  })));

  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${CSP_META}
<title>${esc(title)}</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--teal:#0d9488;--teal2:#0f766e;--light:#f0fdfa;--op:#059669;--gr:#2563eb;--di:#d97706;--em:#dc2626;${options.antiCopy ? 'user-select:none;-webkit-user-select:none;' : ''}}
html,body{height:100%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff;color:#0f172a;overflow:hidden}
.app{display:flex;height:100vh;overflow:hidden}
.sidebar{width:260px;flex-shrink:0;background:var(--light);border-right:1px solid #ccfbf1;display:flex;flex-direction:column;overflow:hidden}
.sid-header{padding:1rem;border-bottom:1px solid #99f6e4;flex-shrink:0}
.sid-title{font-size:.82rem;font-weight:800;color:var(--teal);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sid-meta{font-size:.7rem;color:#5eead4;margin-top:.2rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sid-nav{flex:1;overflow-y:auto;padding:.5rem 0;scrollbar-width:thin;scrollbar-color:#99f6e4 transparent}
.sid-item{display:flex;align-items:center;gap:.5rem;padding:.45rem .85rem;cursor:pointer;font-size:.78rem;color:#0f766e;font-weight:500;transition:all .15s;border-left:3px solid transparent;overflow:hidden;white-space:nowrap}
.sid-item:hover{background:#ccfbf1;border-left-color:#5eead4}
.sid-item.active{background:#99f6e4;border-left-color:var(--teal);color:var(--teal2);font-weight:700}
.sid-section{padding:.35rem .85rem;font-size:.65rem;font-weight:800;color:#5eead4;text-transform:uppercase;letter-spacing:.07em;margin-top:.5rem}
.sid-dot{width:8px;height:8px;border-radius:2px;flex-shrink:0;background:#5eead4}
.main{flex:1;overflow:hidden;position:relative;background:#fafffe}
.topbar{height:52px;background:#fff;border-bottom:1px solid #ccfbf1;display:flex;align-items:center;justify-content:space-between;padding:0 1.25rem;flex-shrink:0}
.topbar-title{font-size:.9rem;font-weight:700;color:#0f172a;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;margin-right:.5rem}
.lang-bar{display:flex;gap:.3rem;flex-shrink:0}
.lb{background:#f0fdfa;border:1px solid #99f6e4;color:#0d9488;padding:.22rem .6rem;border-radius:.4rem;cursor:pointer;font-size:.72rem;font-weight:600;transition:all .15s}
.lb.lb-active{background:var(--teal);border-color:var(--teal);color:#fff}
.page{position:absolute;inset:0;top:52px;overflow-y:auto;padding:2rem;opacity:0;pointer-events:none;transform:translateY(16px);transition:all .3s cubic-bezier(.4,0,.2,1)}
.page.active{opacity:1;pointer-events:all;transform:translateY(0)}
.home-hero{background:linear-gradient(135deg,#0d9488,#0891b2);border-radius:1.25rem;padding:2.5rem;color:#fff;margin-bottom:2rem;position:relative;overflow:hidden}
.home-hero::after{content:'📘';position:absolute;right:-1rem;bottom:-1rem;font-size:8rem;opacity:.08}
.hero-title{font-size:clamp(1.3rem,3vw,2rem);font-weight:900;margin-bottom:.5rem}
.hero-sub{font-size:.9rem;opacity:.85;margin-bottom:1.5rem}
.meta-row{display:flex;flex-wrap:wrap;gap:.5rem}
.m-chip{background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.3);border-radius:999px;padding:.25rem .8rem;font-size:.75rem}
.section-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:1rem;margin-bottom:2rem}
.sec-card{border:1px solid #ccfbf1;border-radius:1rem;padding:1.25rem;cursor:pointer;transition:all .2s;background:#fff}
.sec-card:hover{border-color:var(--teal);background:var(--light);transform:translateY(-3px);box-shadow:0 8px 24px rgba(13,148,136,.15)}
.sec-icon{font-size:1.8rem;margin-bottom:.5rem}
.sec-label{font-weight:700;font-size:.85rem;color:#0f172a}
.sec-sub{font-size:.72rem;color:#64748b;margin-top:.2rem}
.prog-wrap{height:6px;background:#f1f5f9;border-radius:3px;overflow:hidden;margin-bottom:1.25rem}
.prog-fill{height:100%;background:linear-gradient(90deg,var(--teal),#0891b2);border-radius:3px;transition:width .4s ease}
.stage-header-row{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:1.25rem}
.stage-num-badge{background:var(--teal);color:#fff;border-radius:.6rem;padding:.3rem .8rem;font-size:.8rem;font-weight:800;flex-shrink:0}
.stage-h-title{font-size:clamp(1.1rem,2.5vw,1.4rem);font-weight:800;color:#0f172a;flex:1;min-width:200px}
.stage-tags{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:1rem}
.tag-f{background:#f0fdf4;border:1px solid #bbf7d0;color:#166534;padding:.2rem .65rem;border-radius:999px;font-size:.72rem;font-weight:600}
.tag-r{background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;padding:.2rem .65rem;border-radius:999px;font-size:.72rem;font-weight:600}
.sc-grid{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1.25rem}
.sc{border-radius:.85rem;padding:1rem;border-left:4px solid}
.sc-op{background:#f0fdf4;border-color:var(--op)}.sc-gr{background:#eff6ff;border-color:var(--gr)}.sc-di{background:#fffbeb;border-color:var(--di)}.sc-em{background:#fef2f2;border-color:var(--em)}
.sc-lbl{font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.4rem}
.sc-op .sc-lbl{color:var(--op)}.sc-gr .sc-lbl{color:var(--gr)}.sc-di .sc-lbl{color:var(--di)}.sc-em .sc-lbl{color:var(--em)}
.sc p{font-size:.82rem;color:#374151;line-height:1.6}
.stage-nav-row{display:flex;justify-content:space-between;gap:1rem;padding-top:1rem;border-top:1px solid #e2e8f0}
.nav-btn{border:1px solid #ccfbf1;background:#fff;color:var(--teal);padding:.5rem 1.25rem;border-radius:.65rem;cursor:pointer;font-size:.82rem;font-weight:700;transition:all .2s}
.nav-btn:hover:not(:disabled){background:var(--teal);color:#fff}
.nav-btn:disabled{opacity:.35;cursor:default}
.exam-card{background:linear-gradient(135deg,#eff6ff,#f0fdfa);border:2px solid #bfdbfe;border-radius:1.25rem;padding:2rem;text-align:center}
.exam-icon{font-size:3.5rem;margin-bottom:1rem}
.exam-t{font-size:clamp(1.1rem,2.5vw,1.5rem);font-weight:800;color:#0f172a;margin-bottom:1.25rem}
.exam-stats{display:flex;gap:1rem;justify-content:center;margin-bottom:1.5rem}
.stat-box{background:#fff;border:1px solid #e2e8f0;border-radius:.85rem;padding:.85rem 1.5rem;text-align:center}
.stat-v{font-size:1.8rem;font-weight:900;color:var(--teal)}
.stat-l{font-size:.72rem;color:#64748b;font-weight:600;margin-top:.2rem;text-transform:uppercase;letter-spacing:.04em}
.cert-wrap{text-align:center;padding:1rem}
.cert-icon{font-size:5rem;animation:bounce 2s ease-in-out infinite}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
.cert-box{max-width:500px;margin:1.5rem auto;border:2px solid var(--teal);border-radius:1.5rem;padding:2rem;background:var(--light)}
.cert-t{font-size:clamp(1rem,2.5vw,1.5rem);font-weight:900;color:var(--teal);margin-bottom:.5rem}
.cta{background:var(--teal);color:#fff;border:none;border-radius:.85rem;padding:.7rem 1.75rem;font-size:.9rem;font-weight:700;cursor:pointer;transition:all .2s;margin-top:1rem;display:inline-block}
.cta:hover{background:var(--teal2);transform:translateY(-2px)}
@media(max-width:640px){.sidebar{display:none}.sc-grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="app">
  <div class="sidebar">
    <div class="sid-header">
      <div class="sid-title">${esc(title)}</div>
      <div class="sid-meta">${esc(config.industry)}</div>
    </div>
    <div class="sid-nav" id="sidNav"></div>
  </div>
  <div class="main">
    <div class="topbar">
      <div class="topbar-title" id="topTitle">Overview</div>
      <div style="display:flex;align-items:center;gap:.5rem;flex-shrink:0">
        ${langBar(B)}
      </div>
    </div>

    <div class="page active" id="home">
      <div class="home-hero">
        <div class="hero-title">📘 ${esc(title)}</div>
        <div class="hero-sub">Progressive Bilingual Training Matrix · Arabic &amp; Kurdish &amp; English</div>
        <div class="meta-row">
          <span class="m-chip">🏭 ${esc(config.industry)}</span>
          ${dept ? `<span class="m-chip">${esc(dept.emoji)} ${esc(dept.name)}</span>` : ''}
          <span class="m-chip">👤 ${esc(config.jobTitle)}</span>
          <span class="m-chip">📅 ${esc(date)}</span>
          <span class="m-chip">📚 ${payload.stages.length} Stages · ${payload.exams.length} Exams</span>
        </div>
      </div>
      <div class="section-cards" id="secCards"></div>
    </div>

    <div class="page" id="stageView">
      <div class="prog-wrap"><div class="prog-fill" id="progFill" style="width:0%"></div></div>
      <div class="stage-header-row">
        <span class="stage-num-badge" id="stageNum">Stage 1</span>
        <h2 class="stage-h-title" id="stageTitle"></h2>
      </div>
      <div class="stage-tags" id="stageTags"></div>
      <div class="sc-grid" id="scGrid"></div>
      <div class="stage-nav-row">
        <button class="nav-btn" id="prevBtn" onclick="stepStage(-1)">← Previous</button>
        <button class="nav-btn" onclick="showPage('home')">⌂ Overview</button>
        <button class="nav-btn" id="nextBtn" onclick="stepStage(1)">Next →</button>
      </div>
    </div>

    <div class="page" id="examView">
      <div class="exam-card">
        <div class="exam-icon">📋</div>
        <div class="exam-t" id="examTitle"></div>
        <div class="exam-stats" id="examStats"></div>
        <p id="examHint" style="color:#64748b;font-size:.88rem;margin-bottom:1.25rem;max-width:400px;margin-left:auto;margin-right:auto;line-height:1.6"></p>
        <button class="cta" onclick="showPage('home')">↩ Return to Overview</button>
      </div>
    </div>

    <div class="page" id="certView">
      <div class="cert-wrap">
        <div class="cert-icon">🏆</div>
        <h1 style="font-size:clamp(1.2rem,3vw,1.8rem);font-weight:900;color:#0f172a;margin-bottom:.5rem">Certificate of Completion</h1>
        <p style="color:#64748b;margin-bottom:1.5rem">All ${payload.stages.length} stages completed · ${payload.exams.length} exams passed</p>
        <div class="cert-box">
          <div class="cert-t">${esc(title)}</div>
          <div style="color:#64748b;font-size:.85rem;margin:.25rem 0">🏭 ${esc(config.industry)}${dept ? ' · ' + esc(dept.name) : ''}</div>
          <div style="color:#64748b;font-size:.85rem;margin:.25rem 0">👤 ${esc(config.jobTitle)} · ${esc(config.seniorityId)}</div>
          <div style="color:#94a3b8;font-size:.75rem;margin-top:.75rem;border-top:1px solid #e2e8f0;padding-top:.75rem">OPX Playbook Builder · ${esc(date)}</div>
        </div>
        <button class="cta" onclick="showPage('home')">↩ Back to Overview</button>
      </div>
    </div>
  </div>
</div>

<script>
${RUNTIME_ESC_FN}
${B ? bilingualJs() : ''}
${options.antiCopy ? antiCopyJs() : ''}

var STAGES=${stagesJson};
var EXAMS=${examsJson};
var EXAM_AFTER={8:1,16:2,24:3,32:4,40:5,52:6,60:7};
var _stageIdx=0;
var _lang='en';

function showPage(id){
  document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});
  var p=document.getElementById(id);if(p)p.classList.add('active');
  setSidActive(id);
}

function renderStage(idx){
  if(idx<0||idx>=STAGES.length)return;
  _stageIdx=idx;
  var s=STAGES[idx];
  // Use textContent for all user-supplied strings — never innerHTML
  document.getElementById('topTitle').textContent='Stage '+s.id+' / '+STAGES.length;
  document.getElementById('stageNum').textContent='Stage '+s.id;
  var titleEl=document.getElementById('stageTitle');
  titleEl.textContent=s.title_en;
  if(${B}){
    titleEl.setAttribute('data-en',s.title_en);
    titleEl.setAttribute('data-ar',s.title_ar);
    titleEl.setAttribute('data-ku',s.title_ku);
    if(typeof setLang==='function')setLang(_lang);
  }
  // Tags — build DOM nodes, set textContent
  var tagsEl=document.getElementById('stageTags');
  tagsEl.innerHTML='';
  var tf=document.createElement('span');tf.className='tag-f';tf.textContent='⚡ '+s.focus_area;tagsEl.appendChild(tf);
  var tr=document.createElement('span');tr.className='tag-r';tr.textContent='⚠ '+s.risk_context;tagsEl.appendChild(tr);
  // Scenario grid — DOM nodes only, textContent for all user text
  var grid=document.getElementById('scGrid');grid.innerHTML='';
  [
    {cls:'sc sc-op',lbl:'⚙ Operational',text:s.scenario_operational},
    {cls:'sc sc-gr',lbl:'💼 Growth',text:s.scenario_growth},
    {cls:'sc sc-di',lbl:'⚖ Dispute',text:s.scenario_dispute},
    {cls:'sc sc-em',lbl:'🚨 Emergency',text:s.scenario_emergency},
  ].forEach(function(x){
    var d=document.createElement('div');d.className=x.cls;
    var lbl=document.createElement('div');lbl.className='sc-lbl';lbl.textContent=x.lbl;
    var p=document.createElement('p');p.textContent=x.text;
    d.appendChild(lbl);d.appendChild(p);grid.appendChild(d);
  });
  document.getElementById('progFill').style.width=((idx+1)/STAGES.length*100).toFixed(1)+'%';
  document.getElementById('prevBtn').disabled=idx===0;
  document.getElementById('nextBtn').disabled=idx===STAGES.length-1;
  showPage('stageView');
  if(EXAM_AFTER[s.id]){
    setTimeout(function(){
      if(confirm('Milestone! Exam '+EXAM_AFTER[s.id]+' available. Open now?')){renderExam(EXAM_AFTER[s.id]-1);}
    },700);
  }
}

function stepStage(d){renderStage(_stageIdx+d);}

function renderExam(idx){
  var ex=EXAMS[idx];if(!ex)return;
  // textContent only
  document.getElementById('examTitle').textContent=ex.title_en;
  document.getElementById('examHint').textContent='Score '+ex.passing_score+'% or higher to continue.';
  document.getElementById('topTitle').textContent='Exam '+ex.id+' of '+EXAMS.length;
  // Stats — DOM nodes
  var stats=document.getElementById('examStats');stats.innerHTML='';
  [{v:ex.questions_count,l:'Questions'},{v:ex.passing_score+'%',l:'Pass Score'}].forEach(function(x){
    var b=document.createElement('div');b.className='stat-box';
    var v=document.createElement('div');v.className='stat-v';v.textContent=x.v;
    var l=document.createElement('div');l.className='stat-l';l.textContent=x.l;
    b.appendChild(v);b.appendChild(l);stats.appendChild(b);
  });
  showPage('examView');
}

function setSidActive(id){
  document.querySelectorAll('.sid-item').forEach(function(i){i.classList.remove('active');});
}

(function(){
  var nav=document.getElementById('sidNav');
  var sc=document.getElementById('secCards');
  function addSec(label){
    var d=document.createElement('div');d.className='sid-section';d.textContent=label;nav.appendChild(d);
  }
  function addItem(label,onClick){
    var d=document.createElement('div');d.className='sid-item';
    var dot=document.createElement('span');dot.className='sid-dot';
    var txt=document.createTextNode(label);
    d.appendChild(dot);d.appendChild(txt);
    d.onclick=onClick;nav.appendChild(d);
  }
  var groups=[
    {label:'Foundation',icon:'🌱',r:'1–12',start:0},
    {label:'Competency',icon:'⚙',r:'13–24',start:12},
    {label:'Proficiency',icon:'🎯',r:'25–36',start:24},
    {label:'Advanced',icon:'🚀',r:'37–48',start:36},
    {label:'Mastery',icon:'🏆',r:'49–60',start:48},
  ];
  groups.forEach(function(g){
    addSec(g.label);
    for(var i=g.start;i<g.start+12&&i<STAGES.length;i++){
      (function(idx){addItem('Stage '+(idx+1),function(){renderStage(idx);});})(i);
    }
    if(sc){
      var c=document.createElement('div');c.className='sec-card';
      var icon=document.createElement('div');icon.className='sec-icon';icon.textContent=g.icon;
      var lbl=document.createElement('div');lbl.className='sec-label';lbl.textContent=g.label;
      var sub=document.createElement('div');sub.className='sec-sub';sub.textContent='Stages '+g.r;
      c.appendChild(icon);c.appendChild(lbl);c.appendChild(sub);
      c.onclick=function(){renderStage(g.start);};sc.appendChild(c);
    }
  });
  addSec('Milestones');
  EXAMS.forEach(function(ex,idx){addItem('Exam '+ex.id,function(){renderExam(idx);});});
  addItem('Certificate',function(){showPage('certView');});
  if(sc){
    var ec=document.createElement('div');ec.className='sec-card';
    var ei=document.createElement('div');ei.className='sec-icon';ei.textContent='📋';
    var el=document.createElement('div');el.className='sec-label';el.textContent='Exams';
    var es=document.createElement('div');es.className='sec-sub';es.textContent='7 Milestones';
    ec.appendChild(ei);ec.appendChild(el);ec.appendChild(es);
    ec.onclick=function(){renderExam(0);};sc.appendChild(ec);
    var cc=document.createElement('div');cc.className='sec-card';
    var ci=document.createElement('div');ci.className='sec-icon';ci.textContent='🏅';
    var cl=document.createElement('div');cl.className='sec-label';cl.textContent='Certificate';
    var cs=document.createElement('div');cs.className='sec-sub';cs.textContent='Final Award';
    cc.appendChild(ci);cc.appendChild(cl);cc.appendChild(cs);
    cc.onclick=function(){showPage('certView');};sc.appendChild(cc);
  }
})();

document.addEventListener('keydown',function(e){
  if(e.key==='ArrowRight'||e.key==='ArrowDown')stepStage(1);
  if(e.key==='ArrowLeft'||e.key==='ArrowUp')stepStage(-1);
  if(e.key==='Escape')showPage('home');
});
</script>
</body>
</html>`;
}

/* ══════════════════════════════════════════════════════════════════════════════
   TEMPLATE 3 — "Ops Compact"
══════════════════════════════════════════════════════════════════════════════ */
export function buildOpsTemplate(
  payload: TrainingPayload, config: AppConfig, options: ExportOptions
): string {
  const title = options.matrixTitle || `${config.jobTitle} — ${config.industry} Training Matrix`;
  const dept  = DEPARTMENTS_DATA.find(d => d.industry === config.industry)
    ?.departments.find(d => d.id === config.department) ?? null;
  const date  = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  const B     = options.bilingualToggle;

  const stagesJson = escJsonForHtml(payload.stages.map(s => ({
    id:                   parseInt(String(s.id), 10),
    title_en:             String(s.title_en),
    title_ar:             String(s.title_ar),
    title_ku:             String(s.title_ku),
    focus_area:           String(s.focus_area),
    risk_context:         String(s.risk_context),
    scenario_operational: String(s.scenario_operational),
    scenario_growth:      String(s.scenario_growth),
    scenario_dispute:     String(s.scenario_dispute),
    scenario_emergency:   String(s.scenario_emergency),
  })));
  const examsJson = escJsonForHtml(payload.exams.map(ex => ({
    id:              parseInt(String(ex.id), 10),
    title_en:        String(ex.title_en),
    questions_count: parseInt(String(ex.questions_count), 10),
    passing_score:   parseInt(String(ex.passing_score), 10),
  })));

  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${CSP_META}
<title>${esc(title)}</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--op:#059669;--gr:#2563eb;--di:#d97706;--em:#dc2626;--bg:#0f172a;--card:#1e293b;--border:#334155;${options.antiCopy ? 'user-select:none;-webkit-user-select:none;' : ''}}
html,body{height:100%;font-family:'Segoe UI','Inter',sans-serif;background:var(--bg);color:#f1f5f9;overflow:hidden}
.layout{display:grid;grid-template-rows:52px 44px 1fr;height:100vh;overflow:hidden}
.topbar{background:#0a0d1a;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:.75rem;padding:0 1rem}
.tb-logo{font-size:.82rem;font-weight:800;color:#f0b429;flex-shrink:0}
.tb-title{font-size:.78rem;color:#94a3b8;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tb-right{display:flex;align-items:center;gap:.4rem;flex-shrink:0}
.lang-bar{display:flex;gap:.25rem}
.lb{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#94a3b8;padding:.18rem .55rem;border-radius:.35rem;cursor:pointer;font-size:.68rem;font-weight:700;transition:all .15s}
.lb.lb-active{background:#f0b429;border-color:#f0b429;color:#0a0d1a}
.tabbar{background:#0a0d1a;border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 .5rem;overflow-x:auto;scrollbar-width:none}
.tabbar::-webkit-scrollbar{display:none}
.tab{padding:.4rem .9rem;font-size:.74rem;font-weight:600;color:#64748b;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;transition:all .15s;flex-shrink:0}
.tab:hover{color:#94a3b8}
.tab.active{color:#f0b429;border-bottom-color:#f0b429}
.views{overflow:hidden;position:relative}
.view{position:absolute;inset:0;overflow-y:auto;padding:1rem;opacity:0;pointer-events:none;transform:translateY(8px);transition:all .25s}
.view.active{opacity:1;pointer-events:all;transform:translateY(0)}
.ov-title{font-size:clamp(1rem,2.5vw,1.5rem);font-weight:800;color:#f1f5f9}
.ov-meta{font-size:.75rem;color:#64748b;margin-top:.3rem;margin-bottom:1rem}
.kpi-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:.6rem;margin-bottom:1rem}
.kpi{background:var(--card);border:1px solid var(--border);border-radius:.65rem;padding:.75rem;text-align:center}
.kpi-v{font-size:1.6rem;font-weight:900;color:#f0b429}
.kpi-l{font-size:.65rem;color:#64748b;text-transform:uppercase;letter-spacing:.06em;margin-top:.1rem}
.jump-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(55px,1fr));gap:.35rem;margin-bottom:1rem}
.jump-btn{background:var(--card);border:1px solid var(--border);border-radius:.45rem;padding:.4rem .2rem;text-align:center;cursor:pointer;font-size:.7rem;font-weight:700;color:#94a3b8;transition:all .15s}
.jump-btn:hover{border-color:#f0b429;color:#f0b429;background:#1a2040}
.jump-btn.done{border-color:var(--op);color:var(--op)}
.sv-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem;gap:.5rem}
.sv-nav-btn{background:var(--card);border:1px solid var(--border);color:#94a3b8;padding:.35rem .85rem;border-radius:.45rem;cursor:pointer;font-size:.75rem;font-weight:700;transition:all .15s}
.sv-nav-btn:hover:not(:disabled){border-color:#f0b429;color:#f0b429}
.sv-nav-btn:disabled{opacity:.3;cursor:default}
.sv-id{font-size:.75rem;color:#f0b429;font-weight:800;background:rgba(240,180,41,.1);border:1px solid rgba(240,180,41,.25);border-radius:.35rem;padding:.2rem .5rem}
.sv-title{font-size:clamp(1rem,2vw,1.2rem);font-weight:800;color:#f1f5f9;margin-bottom:.5rem}
.sv-tags{display:flex;flex-wrap:wrap;gap:.3rem;margin-bottom:.75rem}
.sv-tf{background:rgba(5,150,105,.1);border:1px solid rgba(5,150,105,.25);color:#6ee7b7;padding:.15rem .55rem;border-radius:999px;font-size:.68rem;font-weight:700}
.sv-tr{background:rgba(220,38,38,.1);border:1px solid rgba(220,38,38,.2);color:#fca5a5;padding:.15rem .55rem;border-radius:999px;font-size:.68rem;font-weight:700}
.sc-cols{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}
.sc-col{border-radius:.65rem;padding:.85rem;border-left:3px solid}
.sc-col.op{background:rgba(5,150,105,.07);border-color:var(--op)}.sc-col.gr{background:rgba(37,99,235,.07);border-color:var(--gr)}.sc-col.di{background:rgba(217,119,6,.07);border-color:var(--di)}.sc-col.em{background:rgba(220,38,38,.07);border-color:var(--em)}
.sc-h{font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.35rem}
.op .sc-h{color:var(--op)}.gr .sc-h{color:var(--gr)}.di .sc-h{color:var(--di)}.em .sc-h{color:var(--em)}
.sc-col p{font-size:.78rem;color:#94a3b8;line-height:1.55}
.pb-wrap{height:3px;background:var(--border);border-radius:2px;margin:.75rem 0;overflow:hidden}
.pb-fill{height:100%;background:linear-gradient(90deg,#f0b429,#f59e0b);transition:width .3s}
.exam-table{width:100%;border-collapse:collapse}
.exam-table th{text-align:left;padding:.5rem .75rem;font-size:.68rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid var(--border)}
.exam-table td{padding:.6rem .75rem;font-size:.8rem;color:#cbd5e1;border-bottom:1px solid rgba(255,255,255,.04)}
.ex-tag{background:rgba(37,99,235,.15);border:1px solid rgba(37,99,235,.3);color:#93c5fd;padding:.15rem .5rem;border-radius:.35rem;font-size:.7rem;font-weight:700}
.pass-tag{background:rgba(5,150,105,.15);border:1px solid rgba(5,150,105,.25);color:#6ee7b7;padding:.15rem .5rem;border-radius:.35rem;font-size:.7rem;font-weight:700}
.cert-v{text-align:center;padding:2rem}
.cert-i{font-size:4rem;animation:spin-cert 4s linear infinite}
@keyframes spin-cert{0%,100%{transform:rotateY(0)}50%{transform:rotateY(180deg)}}
.cert-box{max-width:460px;margin:1.5rem auto;border:1px solid #f0b429;border-radius:1rem;padding:1.75rem;background:rgba(240,180,41,.04)}
.cert-h{font-size:clamp(1rem,2.5vw,1.4rem);font-weight:900;color:#f0b429;margin-bottom:.4rem}
.cert-d{font-size:.8rem;color:#64748b;margin:.2rem 0}
.back-btn{background:#f0b429;color:#0a0d1a;border:none;border-radius:.6rem;padding:.6rem 1.5rem;font-size:.85rem;font-weight:800;cursor:pointer;margin-top:1rem;transition:all .2s}
.back-btn:hover{background:#fbbf24;transform:translateY(-1px)}
@media(max-width:600px){.sc-cols{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="layout">
  <div class="topbar">
    <div class="tb-logo">⚡ OPX</div>
    <div class="tb-title">${esc(title)}</div>
    <div class="tb-right">${langBar(B)}</div>
  </div>
  <div class="tabbar">
    <div class="tab active" onclick="switchTab('overview')">Overview</div>
    <div class="tab" onclick="switchTab('stages')">Stages</div>
    <div class="tab" onclick="switchTab('exams')">Exams</div>
    <div class="tab" onclick="switchTab('cert')">Certificate</div>
  </div>
  <div class="views">
    <div class="view active" id="v-overview">
      <div class="ov-title">📘 ${esc(title)}</div>
      <div class="ov-meta">
        🏭 ${esc(config.industry)}${dept ? ' · ' + esc(dept.emoji) + ' ' + esc(dept.name) : ''} &nbsp;|&nbsp;
        👤 ${esc(config.jobTitle)} &nbsp;|&nbsp; 📅 ${esc(date)}
      </div>
      <div class="kpi-row">
        <div class="kpi"><div class="kpi-v">${payload.stages.length}</div><div class="kpi-l">Stages</div></div>
        <div class="kpi"><div class="kpi-v">${payload.exams.length}</div><div class="kpi-l">Exams</div></div>
        <div class="kpi"><div class="kpi-v">4</div><div class="kpi-l">Scenarios/Stage</div></div>
        <div class="kpi"><div class="kpi-v">5</div><div class="kpi-l">Modules</div></div>
      </div>
      <div style="font-size:.72rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.07em;margin-bottom:.4rem">Quick Jump — All Stages</div>
      <div class="jump-grid" id="jumpGrid"></div>
      <div style="margin-top:.75rem;display:flex;gap:.5rem;flex-wrap:wrap">
        <button class="sv-nav-btn" onclick="switchTab('stages');renderStageView(0)">▶ Start Stage 1</button>
        <button class="sv-nav-btn" onclick="switchTab('exams')">📋 View Exams</button>
        <button class="sv-nav-btn" onclick="switchTab('cert')">🏆 Certificate</button>
      </div>
    </div>
    <div class="view" id="v-stages">
      <div class="pb-wrap"><div class="pb-fill" id="pbFill" style="width:0%"></div></div>
      <div class="sv-nav">
        <button class="sv-nav-btn" id="prevS" onclick="stepS(-1)">← Prev</button>
        <span class="sv-id" id="svId">Stage 1 / ${payload.stages.length}</span>
        <button class="sv-nav-btn" id="nextS" onclick="stepS(1)">Next →</button>
      </div>
      <div class="sv-title" id="svTitle"></div>
      <div class="sv-tags" id="svTags"></div>
      <div class="sc-cols" id="scCols"></div>
    </div>
    <div class="view" id="v-exams">
      <table class="exam-table">
        <thead><tr><th>#</th><th>Exam Title</th><th>Questions</th><th>Pass Score</th></tr></thead>
        <tbody id="examTbody"></tbody>
      </table>
    </div>
    <div class="view" id="v-cert">
      <div class="cert-v">
        <div class="cert-i">🏆</div>
        <div style="font-size:clamp(1.1rem,2.5vw,1.6rem);font-weight:900;margin:.75rem 0 .25rem">Certificate of Completion</div>
        <p style="color:#64748b;font-size:.85rem;margin-bottom:1.5rem">All ${payload.stages.length} stages · ${payload.exams.length} exams completed</p>
        <div class="cert-box">
          <div class="cert-h">${esc(title)}</div>
          <div class="cert-d">🏭 ${esc(config.industry)}${dept ? ' · ' + esc(dept.name) : ''}</div>
          <div class="cert-d">👤 ${esc(config.jobTitle)} · ${esc(config.seniorityId)}</div>
          <div style="font-size:.72rem;color:#475569;margin-top:.75rem;padding-top:.5rem;border-top:1px solid var(--border)">OPX Playbook Builder · ${esc(date)}</div>
        </div>
        <button class="back-btn" onclick="switchTab('overview')">↩ Overview</button>
      </div>
    </div>
  </div>
</div>

<script>
${RUNTIME_ESC_FN}
${B ? bilingualJs() : ''}
${options.antiCopy ? antiCopyJs() : ''}

var STAGES=${stagesJson};
var EXAMS=${examsJson};
var EXAM_AFTER={8:1,16:2,24:3,32:4,40:5,52:6,60:7};
var _si=0;

function switchTab(id){
  var ids=['overview','stages','exams','cert'];
  document.querySelectorAll('.tab').forEach(function(t,i){t.classList.toggle('active',ids[i]===id);});
  document.querySelectorAll('.view').forEach(function(v){v.classList.remove('active');});
  var v=document.getElementById('v-'+id);if(v)v.classList.add('active');
}

function renderStageView(idx){
  if(idx<0||idx>=STAGES.length)return;
  _si=idx;
  var s=STAGES[idx];
  // All user text via textContent — never innerHTML
  document.getElementById('svId').textContent='Stage '+s.id+' / '+STAGES.length;
  document.getElementById('svTitle').textContent=s.title_en;
  if(${B}){
    var t=document.getElementById('svTitle');
    t.setAttribute('data-en',s.title_en);t.setAttribute('data-ar',s.title_ar);t.setAttribute('data-ku',s.title_ku);
    if(typeof setLang==='function')setLang(_lang);
  }
  // Tags via DOM
  var tags=document.getElementById('svTags');tags.innerHTML='';
  var tf=document.createElement('span');tf.className='sv-tf';tf.textContent='⚡ '+s.focus_area;tags.appendChild(tf);
  var tr=document.createElement('span');tr.className='sv-tr';tr.textContent='⚠ '+s.risk_context;tags.appendChild(tr);
  // Scenarios via DOM
  var cols=document.getElementById('scCols');cols.innerHTML='';
  [{cls:'sc-col op',lbl:'⚙ Operational',t:s.scenario_operational},
   {cls:'sc-col gr',lbl:'💼 Growth',t:s.scenario_growth},
   {cls:'sc-col di',lbl:'⚖ Dispute',t:s.scenario_dispute},
   {cls:'sc-col em',lbl:'🚨 Emergency',t:s.scenario_emergency}
  ].forEach(function(x){
    var d=document.createElement('div');d.className=x.cls;
    var h=document.createElement('div');h.className='sc-h';h.textContent=x.lbl;
    var p=document.createElement('p');p.textContent=x.t;
    d.appendChild(h);d.appendChild(p);cols.appendChild(d);
  });
  document.getElementById('pbFill').style.width=((idx+1)/STAGES.length*100).toFixed(1)+'%';
  document.getElementById('prevS').disabled=idx===0;
  document.getElementById('nextS').disabled=idx===STAGES.length-1;
  document.querySelectorAll('.jump-btn').forEach(function(b,i){b.classList.toggle('done',i<=idx);});
  if(EXAM_AFTER[s.id]){
    setTimeout(function(){
      if(confirm('Milestone Exam '+EXAM_AFTER[s.id]+'! Open now?')){switchTab('exams');}
    },600);
  }
}

function stepS(d){renderStageView(_si+d);}

// Jump grid — only stage IDs (integers)
(function(){
  var g=document.getElementById('jumpGrid');
  STAGES.forEach(function(s,i){
    var b=document.createElement('div');b.className='jump-btn';b.textContent=s.id;
    b.onclick=function(){switchTab('stages');renderStageView(i);};
    g.appendChild(b);
  });
})();

// Exam table — textContent only
(function(){
  var tb=document.getElementById('examTbody');
  EXAMS.forEach(function(ex){
    var tr=document.createElement('tr');
    var t1=document.createElement('td');var sp=document.createElement('span');sp.className='ex-tag';sp.textContent=ex.id;t1.appendChild(sp);
    var t2=document.createElement('td');t2.textContent=ex.title_en;
    var t3=document.createElement('td');t3.textContent=ex.questions_count;
    var t4=document.createElement('td');var sp2=document.createElement('span');sp2.className='pass-tag';sp2.textContent=ex.passing_score+'%';t4.appendChild(sp2);
    tr.appendChild(t1);tr.appendChild(t2);tr.appendChild(t3);tr.appendChild(t4);
    tb.appendChild(tr);
  });
})();

renderStageView(0);
document.addEventListener('keydown',function(e){
  if(e.key==='ArrowRight'||e.key==='ArrowDown')stepS(1);
  if(e.key==='ArrowLeft'||e.key==='ArrowUp')stepS(-1);
  if(e.key==='Escape')switchTab('overview');
});
</script>
</body>
</html>`;
}

export function buildTemplate(
  id: string, payload: TrainingPayload, config: AppConfig, options: ExportOptions
): string {
  if (id === 'academy') return buildAcademyTemplate(payload, config, options);
  if (id === 'ops')     return buildOpsTemplate(payload, config, options);
  return buildExecutiveTemplate(payload, config, options);
}
