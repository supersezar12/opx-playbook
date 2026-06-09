import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft, Download, RefreshCw, ShieldCheck, Languages,
  FileText, CheckCircle2, Sparkles, AlertCircle, FileDown,
  LayoutGrid, Monitor, Eye, ChevronRight, Maximize2,
  X, RotateCcw, Zap,
} from 'lucide-react';
import { Button }   from '../ui/Button';
import { Badge }    from '../ui/Badge';
import { Alert }    from '../ui/Alert';
import { Dialog }   from '../ui/Dialog';
import { Input }    from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { buildTemplate }  from '../../lib/htmlTemplates';
import { exportAsPdf }    from '../../lib/pdfExporter';
import { storage }        from '../../lib/localStorage';
import { analytics }      from '../../lib/analytics';
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

/* ── Template catalogue ──────────────────────────────────────────────────── */
const TEMPLATES = [
  {
    id: 'executive' as const,
    name: 'Executive Dark',
    emoji: '🌑',
    tag: 'PREMIUM',
    tagColor: '#f0b429',
    tagline: 'Cinematic full-screen slides · Gold accents · Glassmorphism',
    palette: ['#0a0d1a', '#1e3a5f', '#f0b429', '#10b981'],
    desc: 'A premium dark-navy experience with full-screen animated slide pages, gold progress bar, chapter quick-jump, and floating certificate with trophy animation.',
    features: ['Full-screen slide transitions', 'Gold progress bar', 'Chapter grid (5 modules)', 'Keyboard ← → navigation', 'Floating certificate page'],
    bg: 'linear-gradient(160deg,#0a0d1a 0%,#1e3a5f 60%,#0a0d1a 100%)',
    accentColor: '#f0b429',
    textColor: '#f1f5f9',
  },
  {
    id: 'academy' as const,
    name: 'Academy Light',
    emoji: '🎓',
    tag: 'PROFESSIONAL',
    tagColor: '#0d9488',
    tagline: 'Collapsible sidebar · Clean white · Teal palette',
    palette: ['#ffffff', '#f0fdfa', '#0d9488', '#0891b2'],
    desc: 'A clean, corporate-light layout with a collapsible sidebar listing all 60 stages, smooth fade transitions, animated hero section, and section cards for quick navigation.',
    features: ['60-stage sidebar navigation', 'Dynamic content rendering', 'Colour-coded scenario cards', 'Section cards on overview', 'Smooth fade transitions'],
    bg: 'linear-gradient(160deg,#f0fdfa 0%,#e0f2fe 60%,#f0fdfa 100%)',
    accentColor: '#0d9488',
    textColor: '#0f172a',
  },
  {
    id: 'ops' as const,
    name: 'Ops Compact',
    emoji: '⚡',
    tag: 'DASHBOARD',
    tagColor: '#6366f1',
    tagline: 'Tab interface · 60-stage grid · KPI dashboard',
    palette: ['#0f172a', '#1e293b', '#f0b429', '#6366f1'],
    desc: 'A high-density operations dashboard with tabbed navigation (Overview / Stages / Exams / Certificate), a 60-cell quick-jump grid, KPI cards, and compact dual-column scenario layout.',
    features: ['Tabbed interface (4 tabs)', '60-cell quick-jump grid', 'KPI summary row', 'Dual-column scenarios', 'Table-view exam list'],
    bg: 'linear-gradient(160deg,#0f172a 0%,#1e293b 60%,#0f172a 100%)',
    accentColor: '#f0b429',
    textColor: '#f1f5f9',
  },
] as const;

type TemplateId = typeof TEMPLATES[number]['id'];

/* ── Iframe preview component ───────────────────────────────────────────── */
const TemplateIframe: React.FC<{
  html: string;
  label: string;
  onFullscreen: () => void;
}> = ({ html, label, onFullscreen }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [blobUrl, setBlobUrl] = useState<string>('');

  useEffect(() => {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [html]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '0.75rem', overflow: 'hidden', background: '#0a0d14' }}>
      {blobUrl && (
        <iframe
          ref={iframeRef}
          src={blobUrl}
          title={label}
          sandbox="allow-scripts allow-same-origin"
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        />
      )}
      {/* Fullscreen button */}
      <button
        onClick={onFullscreen}
        title="Open full preview in new tab"
        style={{
          position: 'absolute', top: 8, right: 8,
          background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff', borderRadius: 6, padding: '4px 8px',
          cursor: 'pointer', fontSize: 11, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 4,
          backdropFilter: 'blur(8px)',
        }}
      >
        <Maximize2 size={11} /> Full preview
      </button>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
export const Step5Export: React.FC<Step5Props> = ({
  payload, config, options, onOptionsChange, onBack, onStartNew,
}) => {
  const [phase,        setPhase]        = useState<'pick' | 'config' | 'download'>('pick');
  const [downloading,  setDownloading]  = useState(false);
  const [pdfBusy,      setPdfBusy]      = useState(false);
  const [dlError,      setDlError]      = useState('');
  const [showSuccess,  setShowSuccess]  = useState(false);
  const [lastFmt,      setLastFmt]      = useState<'html' | 'pdf'>('html');
  const [touched,      setTouched]      = useState(false);
  const [errors,       setErrors]       = useState<Step5Errors>({});
  const [previewHtml,  setPreviewHtml]  = useState<Record<TemplateId, string>>({} as Record<TemplateId, string>);
  const [generating,   setGenerating]   = useState<TemplateId | null>(null);
  const [activeTab,    setActiveTab]    = useState<TemplateId>(options.templateId ?? 'executive');

  const defaultTitle = `${config.jobTitle} - ${config.industry} Training Matrix`;
  const deptData     = DEPARTMENTS_DATA
    .find(d => d.industry === config.industry)?.departments
    .find(d => d.id === config.department) ?? null;

  const resolvedOptions: ExportOptions = {
    ...options,
    matrixTitle: options.matrixTitle || defaultTitle,
  };

  /* ── Generate all three previews on mount ── */
  useEffect(() => {
    let cancelled = false;
    async function gen() {
      const results: Partial<Record<TemplateId, string>> = {};
      for (const tpl of TEMPLATES) {
        if (cancelled) return;
        setGenerating(tpl.id);
        await new Promise(r => setTimeout(r, 60)); // yield to render
        results[tpl.id] = buildTemplate(tpl.id, payload, config, resolvedOptions);
        setPreviewHtml(prev => ({ ...prev, [tpl.id]: results[tpl.id]! }));
      }
      setGenerating(null);
    }
    gen();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validate = (): Step5Errors => {
    const e: Step5Errors = {};
    const t = (options.matrixTitle || defaultTitle).trim();
    if (!t) e.matrixTitle = 'Title cannot be empty.';
    if (t.length > 200) e.matrixTitle = 'Max 200 characters.';
    return e;
  };

  const selectTemplate = (id: TemplateId) => {
    setActiveTab(id);
    onOptionsChange({ ...options, templateId: id });
  };

  const openFullPreview = useCallback((id: TemplateId) => {
    const html = previewHtml[id] || buildTemplate(id, payload, config, resolvedOptions);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const win  = window.open(url, '_blank');
    if (win) win.addEventListener('load', () => URL.revokeObjectURL(url));
    else { setDlError('Popup blocked — please allow popups for this site.'); URL.revokeObjectURL(url); }
  }, [previewHtml, payload, config, resolvedOptions]);

  const handleHtml = async () => {
    setTouched(true);
    const errs = validate(); setErrors(errs);
    if (Object.keys(errs).length) return;
    setDownloading(true); setDlError('');
    try {
      await new Promise(r => setTimeout(r, 200));
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

  const handlePdf = async () => {
    setTouched(true);
    const errs = validate(); setErrors(errs);
    if (Object.keys(errs).length) return;
    setPdfBusy(true); setDlError('');
    try {
      exportAsPdf(payload, config, resolvedOptions);
      analytics.track('step_5_pdf_downloaded', { industry: config.industry });
      setLastFmt('pdf'); setShowSuccess(true);
    } catch (e: unknown) { setDlError(`PDF failed: ${(e as Error).message}`); }
    finally { setPdfBusy(false); }
  };

  const selectedTpl = TEMPLATES.find(t => t.id === options.templateId) ?? TEMPLATES[0];
  const filename    = `OPX_${slugify(config.jobTitle)}_${options.templateId}_${formatDate()}.html`;

  /* ════════════════════════════════════════════════════════════════════════
     PHASE 1 — TEMPLATE PICKER (full-width with live iframe previews)
  ════════════════════════════════════════════════════════════════════════ */
  if (phase === 'pick') {
    return (
      <div className="step-transition" style={{ minHeight: 'calc(100vh - 52px)', display: 'flex', flexDirection: 'column' }}>

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem 1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: '1rem', background: 'rgba(240,180,41,0.12)', border: '1px solid rgba(240,180,41,0.3)', marginBottom: '1rem' }}>
            <Monitor size={26} style={{ color: '#f0b429' }} />
          </div>
          <h1 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.5rem' }}>
            Choose Your Template
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b', maxWidth: 480, margin: '0 auto' }}>
            Each template is a fully interactive, self-contained HTML file.
            Preview it live below — then click <strong style={{ color: '#f0b429' }}>Select & Continue</strong>.
          </p>
        </div>

        {/* ── Tab selector ── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '0 1rem 1.25rem', flexWrap: 'wrap' }}>
          {TEMPLATES.map(tpl => {
            const isActive = activeTab === tpl.id;
            return (
              <button
                key={tpl.id}
                onClick={() => setActiveTab(tpl.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.55rem 1.25rem',
                  borderRadius: '0.75rem',
                  border: isActive ? `2px solid ${tpl.accentColor}` : '1px solid rgba(255,255,255,0.10)',
                  background: isActive ? `${tpl.accentColor}18` : 'rgba(255,255,255,0.03)',
                  cursor: 'pointer',
                  color: isActive ? tpl.accentColor : '#64748b',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.85rem',
                  transition: 'all 0.2s',
                  boxShadow: isActive ? `0 0 0 4px ${tpl.accentColor}15` : 'none',
                }}
              >
                <span style={{ fontSize: '1rem' }}>{tpl.emoji}</span>
                {tpl.name}
                {options.templateId === tpl.id && (
                  <span style={{ fontSize: '0.6rem', fontWeight: 900, background: tpl.accentColor, color: '#0a0d14', borderRadius: 999, padding: '0.1rem 0.45rem', letterSpacing: '0.04em' }}>
                    SELECTED
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Live preview area ── */}
        <div style={{ flex: 1, padding: '0 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          {TEMPLATES.map(tpl => {
            if (tpl.id !== activeTab) return null;
            const html = previewHtml[tpl.id];
            const isLoading = generating === tpl.id || (!html && generating !== null);

            return (
              <div key={tpl.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Template info bar */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '0.85rem',
                  background: `${tpl.accentColor}10`,
                  border: `1px solid ${tpl.accentColor}30`,
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{tpl.emoji}</span>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: tpl.accentColor, fontSize: '1rem' }}>{tpl.name}</span>
                      <span style={{ fontSize: '0.62rem', fontWeight: 800, background: tpl.tagColor, color: tpl.id === 'academy' ? '#fff' : '#0a0d14', borderRadius: 999, padding: '0.1rem 0.55rem', letterSpacing: '0.06em' }}>
                        {tpl.tag}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>{tpl.desc}</p>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {tpl.features.map((f, i) => (
                      <span key={i} style={{ fontSize: '0.67rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: '#94a3b8', borderRadius: 6, padding: '0.15rem 0.5rem' }}>
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* iframe preview box */}
                <div style={{
                  flex: 1,
                  minHeight: 480,
                  borderRadius: '1rem',
                  border: `2px solid ${tpl.accentColor}40`,
                  overflow: 'hidden',
                  position: 'relative',
                  background: tpl.bg,
                  boxShadow: `0 0 40px ${tpl.accentColor}15, 0 20px 60px rgba(0,0,0,0.5)`,
                }}>
                  {/* Browser chrome */}
                  <div style={{ height: 32, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', padding: '0 10px', gap: 6, borderBottom: `1px solid ${tpl.accentColor}25` }}>
                    {['#ef4444','#f59e0b','#10b981'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 4, height: 16, marginLeft: 8, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                        OPX_Training_Matrix.html
                      </span>
                    </div>
                    <button
                      onClick={() => openFullPreview(tpl.id)}
                      style={{ marginLeft: 6, background: `${tpl.accentColor}25`, border: `1px solid ${tpl.accentColor}50`, color: tpl.accentColor, borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}
                    >
                      <Maximize2 size={9} /> Open Full
                    </button>
                  </div>

                  {/* The iframe */}
                  <div style={{ height: 'calc(100% - 32px)', position: 'relative' }}>
                    {isLoading ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem' }}>
                        <div style={{ width: 36, height: 36, border: `3px solid ${tpl.accentColor}30`, borderTop: `3px solid ${tpl.accentColor}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Rendering {tpl.name} preview…</span>
                        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                      </div>
                    ) : html ? (
                      <iframe
                        src={(() => {
                          const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
                          return URL.createObjectURL(blob);
                        })()}
                        title={`${tpl.name} preview`}
                        sandbox="allow-scripts allow-same-origin"
                        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <span style={{ color: '#475569', fontSize: '0.85rem' }}>Preview queued…</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Palette swatches */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600 }}>COLOUR PALETTE</span>
                  {tpl.palette.map((c, i) => (
                    <div key={i} title={c} style={{ width: 20, height: 20, borderRadius: '50%', background: c, border: '2px solid rgba(255,255,255,0.15)' }} />
                  ))}
                </div>

              </div>
            );
          })}
        </div>

        {/* ── Bottom action bar ── */}
        <div style={{
          position: 'sticky', bottom: 0,
          background: 'rgba(10,13,20,0.95)', backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '1rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap',
        }}>
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft size={15} /> Back
          </Button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            {TEMPLATES.map(tpl => (
              <button
                key={tpl.id}
                onClick={() => selectTemplate(tpl.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.45rem 1rem',
                  borderRadius: '0.6rem',
                  border: options.templateId === tpl.id ? `2px solid ${tpl.accentColor}` : '1px solid rgba(255,255,255,0.10)',
                  background: options.templateId === tpl.id ? `${tpl.accentColor}18` : 'rgba(255,255,255,0.04)',
                  cursor: 'pointer',
                  color: options.templateId === tpl.id ? tpl.accentColor : '#64748b',
                  fontWeight: options.templateId === tpl.id ? 700 : 400,
                  fontSize: '0.8rem',
                  transition: 'all 0.15s',
                }}
              >
                {tpl.emoji}
                {options.templateId === tpl.id ? `✓ ${tpl.name}` : tpl.name}
              </button>
            ))}
          </div>

          <Button
            variant="gold"
            size="lg"
            onClick={() => setPhase('config')}
            style={{ minWidth: 200 }}
          >
            Use {selectedTpl.emoji} {selectedTpl.name}
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════════════
     PHASE 2 — CONFIG + DOWNLOAD
  ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 step-transition">

      {/* Header */}
      <div className="text-center mb-8">
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: '1rem', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', marginBottom: '1rem' }}>
          <Zap size={26} style={{ color: '#10b981' }} />
        </div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Configure &amp; Download</h1>
        <p className="text-slate-400 mt-2 text-sm">
          Template selected: <span style={{ color: selectedTpl.accentColor, fontWeight: 700 }}>{selectedTpl.emoji} {selectedTpl.name}</span>
          &nbsp;·&nbsp;
          <button onClick={() => setPhase('pick')} style={{ color: '#3b82f6', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Change template
          </button>
        </p>
      </div>

      <div className="space-y-5">

        {/* Selected template summary card */}
        <div style={{
          borderRadius: '1rem', border: `1.5px solid ${selectedTpl.accentColor}40`,
          background: `${selectedTpl.accentColor}08`, padding: '1rem 1.25rem',
          display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
        }}>
          <div style={{
            width: 56, height: 40, borderRadius: '0.5rem',
            background: selectedTpl.bg, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', border: `1px solid ${selectedTpl.accentColor}30`,
          }}>
            {selectedTpl.emoji}
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 700, color: selectedTpl.accentColor, fontSize: '0.95rem' }}>{selectedTpl.name}</span>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem' }}>{selectedTpl.tagline}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {selectedTpl.features.slice(0, 3).map((f, i) => (
              <span key={i} style={{ fontSize: '0.65rem', background: `${selectedTpl.accentColor}15`, border: `1px solid ${selectedTpl.accentColor}30`, color: selectedTpl.accentColor, borderRadius: 5, padding: '0.12rem 0.45rem' }}>✓ {f}</span>
            ))}
          </div>
          <button
            onClick={() => openFullPreview(options.templateId)}
            style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa', borderRadius: 8, padding: '0.4rem 0.85rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}
          >
            <Eye size={12} /> Preview
          </button>
        </div>

        {/* Build config */}
        <Card>
          <CardHeader>
            <CardTitle>Build Options</CardTitle>
            <CardDescription>Customise the exported file.</CardDescription>
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
                icon={<ShieldCheck size={15} style={{ color: '#3b82f6' }} />}
                label="Anti-Copy Protection"
                badge={<Badge variant="info">Recommended</Badge>}
                desc="Disables right-click, F12, Ctrl+U/S/C in the exported file."
              />
              <CBox
                checked={options.bilingualToggle}
                onChange={v => onOptionsChange({ ...options, bilingualToggle: v })}
                icon={<Languages size={15} style={{ color: '#a78bfa' }} />}
                label="Bilingual Toggle (EN / AR / KU)"
                badge={<Badge variant="success">Recommended</Badge>}
                desc="Adds language switcher so readers toggle between English, Arabic and Kurdish."
              />
            </div>
          </CardContent>
        </Card>

        {/* Sanity check */}
        <Card>
          <CardHeader>
            <CardTitle>Sanity Check</CardTitle>
            <CardDescription>First 3 stages and Exam 1 — verify before compiling.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '0.6rem' }}>
              {payload.stages.slice(0, 3).map(stage => (
                <div key={stage.id} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.65rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)' }}>
                  <Badge variant="info" className="mb-1.5">Stage {stage.id}</Badge>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '0.2rem', lineHeight: 1.3 }}>{stage.title_en}</p>
                  <p style={{ fontSize: '0.65rem', color: '#475569', marginBottom: '0.35rem', direction: 'rtl', textAlign: 'right' }}>{stage.title_ar}</p>
                  <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
                    {[['⚙️','#10b981'], ['💼','#3b82f6'], ['⚖️','#f59e0b'], ['🚨','#ef4444']].map(([icon, c], i) => (
                      <span key={i} style={{ fontSize: '0.65rem', padding: '0.1rem 0.3rem', background: `${c}18`, color: c, borderRadius: 3, border: `1px solid ${c}30` }}>{icon}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {payload.exams[0] && (
              <div style={{ border: '2px solid rgba(139,92,246,0.3)', borderRadius: '0.65rem', padding: '0.75rem', background: 'rgba(139,92,246,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa' }}>📋 Exam {payload.exams[0].id}</span>
                </div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>{payload.exams[0].title_en}</p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', fontSize: '0.72rem', color: '#64748b' }}>
                  <span>📝 {payload.exams[0].questions_count} Questions</span>
                  <span>✅ {payload.exams[0].passing_score}% Pass</span>
                </div>
              </div>
            )}

            {/* Summary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.5rem' }}>
              {[
                { v: payload.stages.length, l: 'Stages',    c: '#3b82f6' },
                { v: payload.exams.length,  l: 'Exams',     c: '#a78bfa' },
                { v: options.antiCopy ? 'ON' : 'OFF', l: 'Anti-Copy', c: '#10b981' },
                { v: options.bilingualToggle ? '3 Lang' : 'EN', l: 'Language', c: '#06b6d4' },
              ].map(({ v, l, c }) => (
                <div key={l} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.5rem', padding: '0.5rem' }}>
                  <p style={{ fontSize: '1rem', fontWeight: 900, color: c }}>{v}</p>
                  <p style={{ fontSize: '0.62rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{l}</p>
                </div>
              ))}
            </div>

            {deptData && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.75rem', background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '0.6rem' }}>
                <LayoutGrid size={14} style={{ color: '#a78bfa' }} />
                <span style={{ fontSize: '0.78rem', color: '#c4b5fd' }}>{deptData.emoji} {deptData.name} — department scope applied</span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.6rem' }}>
              <FileText size={13} style={{ color: '#475569', flexShrink: 0 }} />
              <code style={{ fontSize: '0.68rem', color: '#34d399', fontFamily: 'monospace', wordBreak: 'break-all' }}>{filename}</code>
            </div>
          </CardContent>
        </Card>

        {dlError && (
          <Alert variant="danger" title="Export Error">
            <AlertCircle size={14} /> {dlError}
          </Alert>
        )}

        {/* Download buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 pb-10">
          <Button variant="outline" onClick={() => setPhase('pick')}>
            <RotateCcw size={14} /> Change Template
          </Button>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePdf}
              loading={pdfBusy}
              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              <FileDown size={18} />
              {pdfBusy ? 'Generating PDF…' : 'Export as PDF'}
            </Button>
            <Button
              variant="gold"
              size="lg"
              onClick={handleHtml}
              loading={downloading}
              className="sm:min-w-56"
            >
              <Download size={18} />
              {downloading ? 'Compiling…' : `Download ${selectedTpl.emoji} Template`}
            </Button>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onClose={() => setShowSuccess(false)} maxWidth="md">
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5 relative">
            <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-lg" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center">
              <Sparkles size={36} style={{ color: '#0a0d14' }} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-100">
            {lastFmt === 'pdf' ? '📄 PDF Ready!' : '🎉 Export Complete!'}
          </h2>
          <p className="text-slate-400 mt-3 max-w-xs mx-auto text-sm">
            {lastFmt === 'pdf'
              ? 'PDF preview opened. Use "Save as PDF" in the browser print dialog.'
              : `${selectedTpl.emoji} ${selectedTpl.name} compiled and downloaded.`}
          </p>
          <div className="mt-5 px-4 py-4 bg-white/3 border border-white/8 rounded-xl text-left space-y-2">
            {[
              `Template: ${selectedTpl.emoji} ${selectedTpl.name}`,
              `${payload.stages.length} stages · ${payload.exams.length} exams`,
              'Animated transitions · Interactive navigation · Bilingual',
              ...(options.antiCopy ? ['Anti-copy protection active'] : []),
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle2 size={15} style={{ color: '#10b981', flexShrink: 0 }} />
                <span className="text-slate-300">{item}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
            <Button variant="outline" onClick={() => setShowSuccess(false)}>Close</Button>
            <Button variant="secondary" onClick={lastFmt === 'pdf' ? handlePdf : handleHtml}>
              <Download size={14} /> Download Again
            </Button>
            <Button variant="gold" onClick={() => { storage.clearAll(); analytics.track('session_reset'); onStartNew(); }}>
              <RefreshCw size={14} /> New Project
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

/* ── Helper components ───────────────────────────────────────────────────── */
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
