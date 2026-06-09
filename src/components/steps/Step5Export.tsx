import React, { useState } from 'react';
import {
  ChevronLeft, Download, Package, Eye, Trophy, RefreshCw,
  ShieldCheck, Languages, FileText, CheckCircle2, Sparkles,
  AlertCircle, FileDown, LayoutGrid, Monitor,
} from 'lucide-react';
import { Button }    from '../ui/Button';
import { Badge }     from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Alert }     from '../ui/Alert';
import { Dialog }    from '../ui/Dialog';
import { Input }     from '../ui/Input';
import { buildTemplate } from '../../lib/htmlTemplates';
import { exportAsPdf }   from '../../lib/pdfExporter';
import { storage }       from '../../lib/localStorage';
import { analytics }     from '../../lib/analytics';
import { formatDate, slugify } from '../../lib/utils';
import { DEPARTMENTS_DATA }    from '../../data/departments';
import { cn }                  from '../../lib/utils';
import type { TrainingPayload, AppConfig, ExportOptions, Step5Errors } from '../../types';

interface Step5Props {
  payload: TrainingPayload;
  config: AppConfig;
  options: ExportOptions;
  onOptionsChange: (o: ExportOptions) => void;
  onBack: () => void;
  onStartNew: () => void;
}

/* ── Template metadata ── */
const TEMPLATES = [
  {
    id: 'executive' as const,
    name: 'Executive Dark',
    emoji: '🌑',
    tagline: 'Premium dark navy · Gold accents · Cinematic slide transitions',
    palette: ['#0a0d1a', '#f0b429', '#10b981', '#3b82f6'],
    features: ['Full-screen slide navigation', 'Animated progress bar', 'Glassmorphism cards', 'Chapter quick-jump', 'Keyboard arrows support'],
    preview: {
      bg: 'linear-gradient(135deg,#0a0d1a 0%,#1e3a5f 100%)',
      accent: '#f0b429',
      text: '#f1f5f9',
    },
  },
  {
    id: 'academy' as const,
    name: 'Academy Light',
    emoji: '🎓',
    tagline: 'Clean white · Teal palette · Sidebar navigation',
    palette: ['#ffffff', '#0d9488', '#059669', '#2563eb'],
    features: ['Collapsible sidebar with all stages', 'Single-page dynamic rendering', 'Colour-coded scenario cards', 'Animated hero section', 'Smooth fade transitions'],
    preview: {
      bg: 'linear-gradient(135deg,#f0fdfa 0%,#e0f2fe 100%)',
      accent: '#0d9488',
      text: '#0f172a',
    },
  },
  {
    id: 'ops' as const,
    name: 'Ops Compact',
    emoji: '⚡',
    tagline: 'Dark dashboard · Tab interface · High-density grid',
    palette: ['#0f172a', '#f0b429', '#059669', '#ef4444'],
    features: ['Tabbed overview / stages / exams / cert', '60-stage quick-jump grid', 'Colour-coded scenario columns', 'KPI summary cards', 'Compact data-rich layout'],
    preview: {
      bg: 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)',
      accent: '#f0b429',
      text: '#f1f5f9',
    },
  },
];

export const Step5Export: React.FC<Step5Props> = ({
  payload, config, options, onOptionsChange, onBack, onStartNew,
}) => {
  const [downloading,  setDownloading]  = useState(false);
  const [pdfBusy,      setPdfBusy]      = useState(false);
  const [dlError,      setDlError]      = useState('');
  const [showSuccess,  setShowSuccess]  = useState(false);
  const [lastFmt,      setLastFmt]      = useState<'html'|'pdf'>('html');
  const [touched,      setTouched]      = useState(false);
  const [errors,       setErrors]       = useState<Step5Errors>({});
  const [previewing,   setPreviewing]   = useState<string|null>(null);

  const defaultTitle = `${config.jobTitle} - ${config.industry} Training Matrix`;
  const deptData = DEPARTMENTS_DATA
    .find(d => d.industry === config.industry)?.departments
    .find(d => d.id === config.department) ?? null;

  const validate = (): Step5Errors => {
    const e: Step5Errors = {};
    const t = (options.matrixTitle || defaultTitle).trim();
    if (!t) e.matrixTitle = 'Title cannot be empty.';
    if (t.length > 200) e.matrixTitle = 'Max 200 characters.';
    return e;
  };

  const resolvedOptions = { ...options, matrixTitle: options.matrixTitle || defaultTitle };

  /* ── Open preview in new tab ── */
  const handlePreview = (templateId: string) => {
    try {
      const html = buildTemplate(templateId, payload, config, { ...resolvedOptions, templateId: templateId as ExportOptions['templateId'] });
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url  = URL.createObjectURL(blob);
      const win  = window.open(url, '_blank');
      if (!win) { setDlError('Popup blocked. Please allow popups for this site and try again.'); return; }
      win.addEventListener('load', () => URL.revokeObjectURL(url));
    } catch (e: unknown) { setDlError(`Preview failed: ${(e as Error).message}`); }
  };

  /* ── HTML download ── */
  const handleHtml = async () => {
    setTouched(true);
    const errs = validate(); setErrors(errs);
    if (Object.keys(errs).length) return;
    setDownloading(true); setDlError('');
    try {
      await new Promise(r => setTimeout(r, 300));
      const html = buildTemplate(options.templateId, payload, config, resolvedOptions);
      const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' })),
        download: `OPX_${slugify(config.jobTitle)}_${options.templateId}_${formatDate()}.html`,
      });
      a.click(); URL.revokeObjectURL(a.href);
      analytics.track('step_5_html_downloaded', { industry: config.industry, template: options.templateId });
      analytics.track('step_5_completed');
      setLastFmt('html'); setShowSuccess(true);
    } catch (e: unknown) { setDlError(`Export failed: ${(e as Error).message}`); }
    finally { setDownloading(false); }
  };

  /* ── PDF ── */
  const handlePdf = async () => {
    setTouched(true);
    const errs = validate(); setErrors(errs);
    if (Object.keys(errs).length) return;
    setPdfBusy(true); setDlError('');
    try {
      await new Promise(r => setTimeout(r, 150));
      exportAsPdf(payload, config, resolvedOptions);
      analytics.track('step_5_pdf_downloaded', { industry: config.industry });
      setLastFmt('pdf'); setShowSuccess(true);
    } catch (e: unknown) { setDlError(`PDF failed: ${(e as Error).message}`); }
    finally { setPdfBusy(false); }
  };

  const filename = `OPX_${slugify(config.jobTitle)}_${options.templateId}_${formatDate()}.html`;
  const selectedTpl = TEMPLATES.find(t => t.id === options.templateId) ?? TEMPLATES[0];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 step-transition">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 relative">
          <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 blur-md" />
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-600/10 border border-emerald-500/30 flex items-center justify-center">
            <Package className="h-6 w-6 text-emerald-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Compiler &amp; Export Engine</h1>
        <p className="text-slate-400 mt-2 text-sm">Choose a template, preview it live, then download your interactive training matrix.</p>
      </div>

      <div className="space-y-5">

        {/* ══ STEP A — Template Selector ══ */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(240,180,41,0.2)', border: '1px solid rgba(240,180,41,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900, color: '#f0b429', flexShrink: 0 }}>1</span>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9' }}>Select a Template</h2>
            <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '0.25rem' }}>Click to select · Preview opens in new tab</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
            {TEMPLATES.map(tpl => {
              const isSelected = options.templateId === tpl.id;
              return (
                <div key={tpl.id}
                  onClick={() => onOptionsChange({ ...options, templateId: tpl.id })}
                  style={{
                    borderRadius: '1rem',
                    border: isSelected ? '2px solid #f0b429' : '1px solid rgba(255,255,255,0.10)',
                    background: isSelected ? 'rgba(240,180,41,0.06)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    transition: 'all 0.2s',
                    boxShadow: isSelected ? '0 0 0 4px rgba(240,180,41,0.12)' : 'none',
                  }}
                >
                  {/* Mini preview */}
                  <div style={{
                    height: 100,
                    background: tpl.preview.bg,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    {/* Fake UI chrome */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 18, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', paddingLeft: 6, gap: 3 }}>
                      {['#ef4444','#f59e0b','#10b981'].map(c => <div key={c} style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />)}
                    </div>
                    <div style={{ fontSize: '1.8rem', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}>{tpl.emoji}</div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: tpl.preview.text, opacity: 0.9, letterSpacing: '0.04em' }}>{tpl.name.toUpperCase()}</div>
                    {/* Palette dots */}
                    <div style={{ display: 'flex', gap: 3, position: 'absolute', bottom: 6, right: 8 }}>
                      {tpl.palette.map((c, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c, border: '1px solid rgba(255,255,255,0.3)' }} />)}
                    </div>
                    {isSelected && (
                      <div style={{ position: 'absolute', top: 22, right: 8, background: '#f0b429', color: '#0a0d1a', borderRadius: 999, padding: '0.1rem 0.45rem', fontSize: '0.6rem', fontWeight: 900 }}>SELECTED</div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: isSelected ? '#f0b429' : '#f1f5f9' }}>{tpl.name}</span>
                      <button
                        onClick={e => { e.stopPropagation(); handlePreview(tpl.id); }}
                        style={{ fontSize: '0.68rem', fontWeight: 700, color: '#3b82f6', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 6, padding: '0.15rem 0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}
                      >
                        <Monitor size={10} /> Preview
                      </button>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.5rem', lineHeight: 1.4 }}>{tpl.tagline}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      {tpl.features.slice(0, 3).map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: '#475569' }}>
                          <span style={{ color: tpl.preview.accent, fontSize: '0.6rem' }}>✓</span> {f}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected template features */}
          <div style={{ marginTop: '0.6rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.2rem' }}>{selectedTpl.emoji}</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f0b429' }}>{selectedTpl.name}</span>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>—</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {selectedTpl.features.map((f, i) => (
                <span key={i} style={{ fontSize: '0.68rem', background: 'rgba(240,180,41,0.08)', border: '1px solid rgba(240,180,41,0.2)', color: '#fbbf24', borderRadius: 999, padding: '0.1rem 0.5rem' }}>{f}</span>
              ))}
            </div>
            <button
              onClick={() => handlePreview(options.templateId)}
              style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#2563eb,#6366f1)', border: 'none', borderRadius: 8, padding: '0.35rem 0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}
            >
              <Eye size={12} /> Live Preview
            </button>
          </div>
        </div>

        {/* ══ STEP B — Build Options ══ */}
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(240,180,41,0.2)', border: '1px solid rgba(240,180,41,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900, color: '#f0b429', flexShrink: 0 }}>2</span>
              <CardTitle>Build Configuration</CardTitle>
            </div>
            <CardDescription>Set the title, anti-copy, and bilingual options.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Training Matrix Title *"
              value={options.matrixTitle}
              onChange={e => { onOptionsChange({ ...options, matrixTitle: e.target.value }); if (touched) setErrors(validate()); }}
              onBlur={() => { setTouched(true); setErrors(validate()); }}
              placeholder={defaultTitle}
              hint={`Default: "${defaultTitle}"`}
              error={touched ? errors.matrixTitle : undefined}
            />
            <div className="space-y-3">
              <CBox
                checked={options.antiCopy}
                onChange={v => onOptionsChange({ ...options, antiCopy: v })}
                icon={<ShieldCheck className="h-4 w-4 text-blue-400" />}
                label="Anti-Copy Protection"
                badge={<Badge variant="info">Recommended</Badge>}
                desc="Disables right-click, F12, Ctrl+U/S/C and DevTools detection in the exported file."
              />
              <CBox
                checked={options.bilingualToggle}
                onChange={v => onOptionsChange({ ...options, bilingualToggle: v })}
                icon={<Languages className="h-4 w-4 text-purple-400" />}
                label="Bilingual Toggle UI (EN / AR / KU)"
                badge={<Badge variant="success">Recommended</Badge>}
                desc="Adds language switcher. Stage and exam titles toggle between English, Arabic and Kurdish."
              />
            </div>
          </CardContent>
        </Card>

        {/* ══ STEP C — Sanity Check ══ */}
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(240,180,41,0.2)', border: '1px solid rgba(240,180,41,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900, color: '#f0b429', flexShrink: 0 }}>3</span>
              <CardTitle>Sanity Check</CardTitle>
            </div>
            <CardDescription>First 3 stages and exam 1 — verify content before compiling.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {payload.stages.slice(0, 3).map(stage => (
                <div key={stage.id} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)' }}>
                  <Badge variant="info" className="mb-2">Stage {stage.id}</Badge>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '0.25rem' }}>{stage.title_en}</p>
                  <p style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: '0.5rem', direction: 'rtl', textAlign: 'right' }}>{stage.title_ar}</p>
                  <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                    {stage.scenario_operational && <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', background: 'rgba(16,185,129,0.12)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 4 }}>⚙️</span>}
                    {stage.scenario_growth      && <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', background: 'rgba(59,130,246,0.12)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 4 }}>💼</span>}
                    {stage.scenario_dispute     && <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', background: 'rgba(245,158,11,0.12)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 4 }}>⚖️</span>}
                    {stage.scenario_emergency   && <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', background: 'rgba(220,38,38,0.12)', color: '#fca5a5', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 4 }}>🚨</span>}
                  </div>
                </div>
              ))}
            </div>
            {payload.exams[0] && (
              <div style={{ border: '2px solid rgba(139,92,246,0.3)', borderRadius: '0.75rem', padding: '0.85rem', background: 'rgba(139,92,246,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                  <Trophy className="h-4 w-4 text-purple-400" />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a78bfa' }}>Exam {payload.exams[0].id}</span>
                </div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>{payload.exams[0].title_en}</p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.3rem', fontSize: '0.75rem', color: '#64748b' }}>
                  <span>📝 {payload.exams[0].questions_count} Questions</span>
                  <span>✅ {payload.exams[0].passing_score}% Pass</span>
                </div>
              </div>
            )}

            {/* Summary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.5rem', marginTop: '0.25rem' }}>
              {[
                { v: payload.stages.length, l: 'Stages', c: '#3b82f6' },
                { v: payload.exams.length,  l: 'Exams',  c: '#a78bfa' },
                { v: options.antiCopy ? 'ON' : 'OFF', l: 'Anti-Copy', c: '#10b981' },
                { v: options.bilingualToggle ? '3 Lang' : 'EN only', l: 'Language', c: '#06b6d4' },
              ].map(({v, l, c}) => (
                <div key={l} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.5rem', padding: '0.5rem' }}>
                  <p style={{ fontSize: '1rem', fontWeight: 900, color: c }}>{v}</p>
                  <p style={{ fontSize: '0.62rem', color: '#475569', marginTop: '0.1rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{l}</p>
                </div>
              ))}
            </div>

            {deptData && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '0.6rem' }}>
                <LayoutGrid className="h-4 w-4 text-violet-400" />
                <span style={{ fontSize: '0.78rem', color: '#c4b5fd' }}>{deptData.emoji} {deptData.name} — department scope applied</span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.6rem' }}>
              <FileText className="h-4 w-4 text-slate-500" />
              <code style={{ fontSize: '0.7rem', color: '#34d399', fontFamily: 'monospace', wordBreak: 'break-all' }}>{filename}</code>
            </div>
          </CardContent>
        </Card>

        {dlError && (
          <Alert variant="danger" title="Export Error">
            <AlertCircle className="h-4 w-4" /> {dlError}
          </Alert>
        )}

        {/* ══ STEP D — Export Buttons ══ */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(240,180,41,0.2)', border: '1px solid rgba(240,180,41,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900, color: '#f0b429', flexShrink: 0 }}>4</span>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9' }}>Download</h2>
          </div>
          <div className="flex flex-col sm:flex-row justify-between gap-4 pb-10">
            <Button variant="outline" onClick={onBack}>
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" size="lg" onClick={handlePdf} loading={pdfBusy}
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
                <FileDown className="h-5 w-5" />
                {pdfBusy ? 'Generating PDF...' : 'Export as PDF'}
              </Button>
              <Button variant="gold" size="lg" onClick={handleHtml} loading={downloading} className="sm:min-w-56">
                <Download className="h-5 w-5" />
                {downloading ? 'Compiling...' : `Download ${selectedTpl.emoji} ${selectedTpl.name}`}
              </Button>
            </div>
          </div>
        </div>

      </div>

      {/* ── Success Dialog ── */}
      <Dialog open={showSuccess} onClose={() => setShowSuccess(false)} maxWidth="md">
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5 relative">
            <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-lg" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center shadow-gold-md">
              <Sparkles className="h-9 w-9 text-gray-900" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-100">
            {lastFmt === 'pdf' ? '📄 PDF Ready!' : '🎉 Export Complete!'}
          </h2>
          <p className="text-slate-400 mt-3 max-w-xs mx-auto text-sm">
            {lastFmt === 'pdf'
              ? 'PDF preview opened. Use "Save as PDF" in the browser print dialog.'
              : `"${selectedTpl.name}" template compiled and downloaded.`}
          </p>
          <div className="mt-5 px-4 py-4 bg-white/3 border border-white/8 rounded-xl text-left space-y-2">
            {[
              `${payload.stages.length} stages · ${payload.exams.length} exams`,
              `Template: ${selectedTpl.emoji} ${selectedTpl.name}`,
              'Animated transitions · Interactive navigation',
              'Bilingual (EN / AR / KU) titles',
              ...(options.antiCopy ? ['Anti-copy protection active'] : []),
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300">{item}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
            <Button variant="outline" onClick={() => setShowSuccess(false)}>Close</Button>
            <Button variant="secondary" onClick={lastFmt === 'pdf' ? handlePdf : handleHtml}>
              <Download className="h-4 w-4" /> Download Again
            </Button>
            <Button variant="gold" onClick={() => { storage.clearAll(); analytics.track('session_reset'); onStartNew(); }}>
              <RefreshCw className="h-4 w-4" /> New Project
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

const CBox: React.FC<{
  checked: boolean; onChange: (v: boolean) => void;
  icon: React.ReactNode; label: string; badge?: React.ReactNode; desc: string;
}> = ({ checked, onChange, icon, label, badge, desc }) => (
  <label style={{
    display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.85rem 1rem',
    borderRadius: '0.75rem', cursor: 'pointer', transition: 'all 0.15s',
    border: checked ? '2px solid rgba(240,180,41,0.35)' : '1px solid rgba(255,255,255,0.08)',
    background: checked ? 'rgba(240,180,41,0.05)' : 'rgba(255,255,255,0.02)',
  }}>
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
      style={{ width: 16, height: 16, marginTop: 2, accentColor: '#f0b429', flexShrink: 0 }} />
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        {icon}
        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f1f5f9' }}>{label}</span>
        {badge}
      </div>
      <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>{desc}</p>
    </div>
  </label>
);
