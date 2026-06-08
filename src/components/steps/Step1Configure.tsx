import React, { useState, useEffect, useRef } from 'react';
import {
  Settings2, Briefcase, AlertTriangle, Target, ChevronRight,
  Building2, FileText, Info, LayoutGrid, Sparkles,
} from 'lucide-react';
import { INDUSTRIES_DATA }         from '../../data/industries';
import { DEPARTMENTS_DATA }        from '../../data/departments';
import { SENIORITY_LEVELS }        from '../../data/seniority';
import { PRODUCT_CATEGORIES_DATA } from '../../data/productCategories';
import { Button }    from '../ui/Button';
import { Badge }     from '../ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Select }    from '../ui/Select';
import { Input }     from '../ui/Input';
import { Textarea }  from '../ui/Textarea';
import { Alert }     from '../ui/Alert';
import { cn }        from '../../lib/utils';
import { analytics } from '../../lib/analytics';
import type { AppConfig, Step1Errors } from '../../types';

interface Step1Props {
  config: AppConfig;
  onConfigChange: (config: AppConfig) => void;
  onNext: () => void;
}

function validate(config: AppConfig): Step1Errors {
  const e: Step1Errors = {};
  if (!config.industry.trim())      e.industry    = 'Please select an industry sector.';
  if (!config.jobTitle.trim())      e.jobTitle    = 'Job title is required.';
  else if (config.jobTitle.trim().length < 3)   e.jobTitle = 'Must be at least 3 characters.';
  else if (config.jobTitle.trim().length > 120)  e.jobTitle = 'Must be 120 characters or fewer.';
  if (!config.seniorityId)          e.seniorityId = 'Please select a seniority level.';
  return e;
}

const SENIORITY_ICONS: Record<string, string> = { entry: '🔧', junior: '📊', senior: '🎯' };
const IS_DIST = (industry: string) => industry === 'Distribution Company';

export const Step1Configure: React.FC<Step1Props> = ({ config, onConfigChange, onNext }) => {
  const [touched, setTouched] = useState({ industry: false, department: false, jobTitle: false, seniorityId: false });
  const [errors,  setErrors]  = useState<Step1Errors>({});
  const catRef = useRef<HTMLDivElement>(null);

  const selectedIndustry  = INDUSTRIES_DATA.find(i => i.industry === config.industry);
  const selectedSeniority = SENIORITY_LEVELS.find(s => s.id === config.seniorityId);
  const industryDepts     = DEPARTMENTS_DATA.find(d => d.industry === config.industry)?.departments ?? [];
  const selectedDept      = industryDepts.find(d => d.id === config.department) ?? null;

  useEffect(() => {
    if (Object.values(touched).some(Boolean)) setErrors(validate(config));
  }, [config, touched]);

  // Auto-scroll to product categories when Distribution Company is selected
  useEffect(() => {
    if (IS_DIST(config.industry) && catRef.current) {
      setTimeout(() => catRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    }
  }, [config.industry]);

  const touch = (f: keyof typeof touched) => setTouched(t => ({ ...t, [f]: true }));

  const handleIndustryChange = (v: string) => {
    onConfigChange({ ...config, industry: v, department: '', productCategories: [] });
    touch('industry');
  };

  const toggleCategory = (id: string) => {
    const cur = config.productCategories ?? [];
    onConfigChange({ ...config, productCategories: cur.includes(id) ? cur.filter(c => c !== id) : [...cur, id] });
  };

  const handleNext = () => {
    setTouched({ industry: true, department: true, jobTitle: true, seniorityId: true });
    const errs = validate(config);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    analytics.track('step_1_completed', {
      industry: config.industry,
      department: config.department || '(none)',
      productCategories: (config.productCategories ?? []).join(',') || '(none)',
      seniority: config.seniorityId,
      hasPolicy: config.policyText.trim().length > 0,
    });
    onNext();
  };

  const errorCount = Object.keys(errors).length;
  const allTouched = touched.industry && touched.jobTitle && touched.seniorityId;
  const selectedCats = PRODUCT_CATEGORIES_DATA.filter(c => (config.productCategories ?? []).includes(c.id));
  const titlePlaceholder = selectedDept?.typicalRoles.slice(0, 2).join(', ') ?? 'e.g., Drilling Floor Supervisor';

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 step-transition">

      {/* Page header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 relative">
          <div className="absolute inset-0 rounded-2xl bg-amber-500/20 blur-md" />
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border border-amber-500/30 flex items-center justify-center">
            <Settings2 className="h-6 w-6 text-amber-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Context Configurator</h1>
        <p className="text-slate-400 mt-2 text-sm max-w-sm mx-auto leading-relaxed">
          Select your industry and role. For Distribution Company, choose your product portfolio directly below.
        </p>
      </div>

      {allTouched && errorCount > 0 && (
        <Alert variant="danger" title={`${errorCount} field${errorCount > 1 ? 's' : ''} need attention`} className="mb-6">
          Fix the highlighted fields below to continue.
        </Alert>
      )}

      <div className="space-y-5">

        {/* ── INDUSTRY ──────────────────────────────────────────────────── */}
        <Card className={cn(touched.industry && errors.industry ? 'border-red-500/40' : '')}>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <IconBox color="blue"><Building2 className="h-3.5 w-3.5 text-blue-400" /></IconBox>
              <div>
                <CardTitle>Industry Sector <Star /></CardTitle>
                <CardDescription>Select your primary industry.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Select
              options={INDUSTRIES_DATA.map(i => ({ value: i.industry, label: i.industry }))}
              value={config.industry}
              onChange={handleIndustryChange}
              placeholder="Select an industry..."
              error={touched.industry ? errors.industry : undefined}
            />
            {selectedIndustry && (
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Target className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Focus Areas</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedIndustry.focuses.map((f, i) => <Badge key={i} variant="success">{f}</Badge>)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Key Risks</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedIndustry.risks.map((r, i) => <Badge key={i} variant="warning">{r}</Badge>)}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ══════════════════════════════════════════════════════════════════
            PRODUCT PORTFOLIO CONTEXT
            Appears IMMEDIATELY after Industry when Distribution Company
        ══════════════════════════════════════════════════════════════════ */}
        {IS_DIST(config.industry) && (
          <div ref={catRef}>
            <ProductCategoryPanel
              selected={config.productCategories ?? []}
              onToggle={toggleCategory}
              onSelectAll={() => onConfigChange({ ...config, productCategories: PRODUCT_CATEGORIES_DATA.map(c => c.id) })}
              onClearAll={() => onConfigChange({ ...config, productCategories: [] })}
            />
          </div>
        )}

        {/* ── DEPARTMENT ────────────────────────────────────────────────── */}
        <Card className={cn(!config.industry ? 'opacity-40 pointer-events-none' : '')}>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <IconBox color="violet"><LayoutGrid className="h-3.5 w-3.5 text-violet-400" /></IconBox>
              <div>
                <CardTitle>Department <span className="text-slate-600 font-normal text-xs ml-1">(Optional)</span></CardTitle>
                <CardDescription>Narrow scope to a specific department.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {industryDepts.length === 0 ? (
              <p className="text-sm text-slate-600 italic">Select an industry first.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {industryDepts.map(dept => {
                    const isSel = config.department === dept.id;
                    return (
                      <button key={dept.id} onClick={() => { onConfigChange({ ...config, department: isSel ? '' : dept.id }); touch('department'); }}
                        aria-pressed={isSel}
                        className={cn('flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all duration-150',
                          isSel ? 'border-violet-500/50 bg-violet-500/10' : 'border-white/8 bg-white/2 hover:border-white/16 hover:bg-white/5')}>
                        <span className="text-lg flex-shrink-0 mt-0.5">{dept.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className={cn('font-medium text-sm', isSel ? 'text-violet-300' : 'text-slate-300')}>{dept.name}</p>
                          <p className="text-xs text-slate-600 mt-0.5 truncate">{dept.typicalRoles.slice(0, 3).join(' · ')}</p>
                        </div>
                        <div className={cn('w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 mt-1 transition-all', isSel ? 'border-violet-400 bg-violet-400' : 'border-slate-600')} />
                      </button>
                    );
                  })}
                </div>
                {selectedDept && (
                  <div className="mt-4 p-4 rounded-xl border border-violet-500/25 bg-violet-500/8 space-y-2">
                    <div className="flex items-center gap-2">
                      <span>{selectedDept.emoji}</span>
                      <span className="font-semibold text-sm text-violet-300">{selectedDept.name}</span>
                      <Badge variant="violet" className="ml-auto">Selected</Badge>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1.5"><Sparkles className="h-3 w-3 text-violet-400"/><span className="text-xs font-semibold text-violet-500 uppercase tracking-wider">Sub-Focuses → Injected into prompt</span></div>
                      <div className="flex flex-wrap gap-1.5">{selectedDept.subFocuses.map((sf, i) => <Badge key={i} variant="violet">{sf}</Badge>)}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1.5"><Briefcase className="h-3 w-3 text-slate-500"/><span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Typical Roles</span></div>
                      <div className="flex flex-wrap gap-1.5">{selectedDept.typicalRoles.map((r, i) => <Badge key={i} variant="outline">{r}</Badge>)}</div>
                    </div>
                  </div>
                )}
                {config.department && (
                  <button onClick={() => onConfigChange({ ...config, department: '' })} className="mt-2 text-xs text-slate-600 hover:text-red-400 transition-colors">✕ Clear department</button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* ── JOB TITLE ─────────────────────────────────────────────────── */}
        <Card className={cn(touched.jobTitle && errors.jobTitle ? 'border-red-500/40' : '')}>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <IconBox color="purple"><Briefcase className="h-3.5 w-3.5 text-purple-400" /></IconBox>
              <div>
                <CardTitle>Job Title / Role <Star /></CardTitle>
                <CardDescription>The exact role this matrix is designed for{selectedDept ? ` within ${selectedDept.name}` : ''}.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Input
              placeholder={titlePlaceholder}
              value={config.jobTitle}
              onChange={e => { onConfigChange({ ...config, jobTitle: e.target.value }); touch('jobTitle'); }}
              onBlur={() => touch('jobTitle')}
              error={touched.jobTitle ? errors.jobTitle : undefined}
              hint="Embedded directly into the AI prompt and exported file."
            />
            {selectedDept && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {selectedDept.typicalRoles.map((role, i) => (
                  <button key={i} onClick={() => { onConfigChange({ ...config, jobTitle: role }); touch('jobTitle'); }}
                    className="text-xs px-2 py-0.5 rounded-full border border-violet-500/25 bg-violet-500/8 text-violet-400 hover:bg-violet-500/20 transition-colors">
                    {role}
                  </button>
                ))}
              </div>
            )}
            <div className="flex justify-end mt-1">
              <span className={cn('text-xs', config.jobTitle.length > 100 ? 'text-amber-400' : 'text-slate-600')}>{config.jobTitle.length}/120</span>
            </div>
          </CardContent>
        </Card>

        {/* ── SENIORITY ─────────────────────────────────────────────────── */}
        <Card className={cn(touched.seniorityId && errors.seniorityId ? 'border-red-500/40' : '')}>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <IconBox color="indigo"><Target className="h-3.5 w-3.5 text-indigo-400" /></IconBox>
              <div>
                <CardTitle>Seniority Layer <Star /></CardTitle>
                <CardDescription>Shapes the tone and cognitive depth of every scenario.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SENIORITY_LEVELS.map(level => {
                const isSel = config.seniorityId === level.id;
                return (
                  <button key={level.id} onClick={() => { onConfigChange({ ...config, seniorityId: level.id }); touch('seniorityId'); }}
                    aria-pressed={isSel}
                    className={cn('flex flex-col gap-2.5 p-4 rounded-xl border-2 text-left transition-all duration-150',
                      isSel ? 'border-amber-500/40 bg-amber-500/8' : 'border-white/8 bg-white/2 hover:border-white/16 hover:bg-white/5')}>
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{SENIORITY_ICONS[level.id]}</span>
                      <div className={cn('w-3.5 h-3.5 rounded-full border-2 transition-all', isSel ? 'border-amber-400 bg-amber-400' : 'border-slate-600')} />
                    </div>
                    <p className={cn('font-semibold text-sm leading-snug', isSel ? 'text-amber-300' : 'text-slate-300')}>{level.label}</p>
                  </button>
                );
              })}
            </div>
            {selectedSeniority && (
              <div className="mt-3 flex items-start gap-2 p-3 rounded-xl border border-amber-500/20 bg-amber-500/6">
                <Info className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300/80"><strong className="text-amber-300">Tonal Frame:</strong> {selectedSeniority.tone}</p>
              </div>
            )}
            {touched.seniorityId && errors.seniorityId && <p className="text-xs text-red-400 mt-2">⚠ {errors.seniorityId}</p>}
          </CardContent>
        </Card>

        {/* ── POLICY PATCH ──────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <IconBox color="teal"><FileText className="h-3.5 w-3.5 text-teal-400" /></IconBox>
              <div>
                <CardTitle>Policy Patch <span className="text-slate-600 font-normal text-xs ml-1">(Optional)</span></CardTitle>
                <CardDescription>Company policy injected as a priority context layer into the AI prompt.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={`"All employees must complete mandatory HSE induction within 30 days of joining..."`}
              value={config.policyText}
              onChange={e => onConfigChange({ ...config, policyText: e.target.value })}
              rows={5}
              className="font-mono text-xs"
            />
            {config.policyText.trim() && (
              <p className="text-xs text-emerald-400 mt-2">✓ {config.policyText.trim().split(/\s+/).length} words will be injected.</p>
            )}
          </CardContent>
        </Card>

        {/* ── NAV ───────────────────────────────────────────────────────── */}
        <div className="flex justify-end pb-10">
          <Button variant="gold" size="lg" onClick={handleNext} className="min-w-52">
            Next: Generate Prompt
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

      </div>
    </div>
  );
};

/* ─── Shared small components ────────────────────────────────────────────── */
const Star = () => <span className="text-amber-500 ml-0.5 text-xs">*</span>;

const IconBox: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => {
  const map: Record<string, { bg: string; border: string }> = {
    blue:   { bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.25)'  },
    violet: { bg: 'rgba(139,92,246,0.15)',  border: 'rgba(139,92,246,0.25)'  },
    purple: { bg: 'rgba(168,85,247,0.15)',  border: 'rgba(168,85,247,0.25)'  },
    indigo: { bg: 'rgba(99,102,241,0.15)',  border: 'rgba(99,102,241,0.25)'  },
    teal:   { bg: 'rgba(20,184,166,0.15)',  border: 'rgba(20,184,166,0.25)'  },
  };
  const c = map[color] ?? map.blue;
  return (
    <div style={{ width: 28, height: 28, borderRadius: 8, background: c.bg, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {children}
    </div>
  );
};

/* ─── Product Category Panel — fully inline styled, zero Tailwind dependency ─ */
const ProductCategoryPanel: React.FC<{
  selected: string[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}> = ({ selected, onToggle, onSelectAll, onClearAll }) => {
  const selectedCats = PRODUCT_CATEGORIES_DATA.filter(c => selected.includes(c.id));

  return (
    <div style={{
      borderRadius: '1rem',
      border: '2px solid rgba(249,115,22,0.50)',
      background: 'rgba(15,20,30,0.95)',
      overflow: 'hidden',
      boxShadow: '0 0 0 4px rgba(249,115,22,0.08), 0 8px 32px rgba(0,0,0,0.4)',
    }}>

      {/* ── Header ── */}
      <div style={{ padding: '1rem 1.25rem', background: 'rgba(249,115,22,0.10)', borderBottom: '1px solid rgba(249,115,22,0.25)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ fontSize: '1.5rem', flexShrink: 0, lineHeight: 1 }}>🛒</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fed7aa', margin: 0 }}>
              Product Portfolio Context
            </h2>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#f97316', background: 'rgba(249,115,22,0.20)', border: '1px solid rgba(249,115,22,0.40)', borderRadius: 999, padding: '0.1rem 0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Distribution Company
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.25rem 0 0', lineHeight: 1.5 }}>
            Select every product category your company handles. Temperature requirements, shelf life rules, and handling protocols for each category are <strong style={{ color: '#fdba74' }}>injected directly into the AI prompt</strong>.
          </p>
        </div>
      </div>

      {/* ── Category grid ── */}
      <div style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {PRODUCT_CATEGORIES_DATA.map(cat => {
            const isSel = selected.includes(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => onToggle(cat.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '0.65rem',
                  border: isSel ? '1.5px solid rgba(249,115,22,0.7)' : '1px solid rgba(255,255,255,0.10)',
                  background: isSel ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.03)',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  transition: 'all 0.15s',
                  outline: 'none',
                }}
              >
                <span style={{ fontSize: '1.15rem', flexShrink: 0, lineHeight: 1, marginTop: 1 }}>{cat.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.78rem', fontWeight: 600, margin: 0, lineHeight: 1.3, color: isSel ? '#fdba74' : '#cbd5e1' }}>{cat.name}</p>
                  <p style={{ fontSize: '0.66rem', color: '#64748b', margin: '0.1rem 0 0', lineHeight: 1.3 }}>{cat.tempRange}</p>
                </div>
                <div style={{
                  width: 14, height: 14, borderRadius: 3, flexShrink: 0, marginTop: 2,
                  border: isSel ? '2px solid #f97316' : '2px solid #475569',
                  background: isSel ? '#f97316' : 'transparent',
                  transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isSel && <span style={{ color: '#fff', fontSize: 9, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Quick actions ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={onSelectAll}
            style={{ fontSize: '0.72rem', fontWeight: 600, color: '#f97316', background: 'rgba(249,115,22,0.10)', border: '1px solid rgba(249,115,22,0.30)', borderRadius: 999, padding: '0.25rem 0.75rem', cursor: 'pointer' }}>
            Select All ({PRODUCT_CATEGORIES_DATA.length})
          </button>
          {selected.length > 0 && (
            <button onClick={onClearAll}
              style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 999, padding: '0.25rem 0.75rem', cursor: 'pointer' }}>
              ✕ Clear All
            </button>
          )}
          <span style={{ fontSize: '0.72rem', color: selected.length > 0 ? '#f97316' : '#475569', marginLeft: 'auto', fontWeight: selected.length > 0 ? 700 : 400 }}>
            {selected.length} / {PRODUCT_CATEGORIES_DATA.length} selected
          </span>
        </div>

        {/* ── Selected detail cards ── */}
        {selectedCats.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 0.5rem' }}>
              ✅ {selectedCats.length} categor{selectedCats.length > 1 ? 'ies' : 'y'} will be injected into the AI prompt:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {selectedCats.map(cat => (
                <div key={cat.id} style={{ borderRadius: '0.65rem', border: '1px solid rgba(249,115,22,0.30)', background: 'rgba(249,115,22,0.07)', padding: '0.65rem 0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '1rem' }}>{cat.emoji}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#fdba74' }}>{cat.name}</span>
                    <span style={{ fontSize: '0.68rem', color: '#f97316', background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 4, padding: '0.1rem 0.4rem', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                      {cat.tempRange}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0 0 0.3rem', lineHeight: 1.5 }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Shelf life: </span>{cat.shelfLife}
                    {'  ·  '}
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Handling: </span>{cat.handling.slice(0, 70)}{cat.handling.length > 70 ? '…' : ''}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: '#ef4444', margin: '0 0 0.35rem', lineHeight: 1.4 }}>
                    <span style={{ fontWeight: 700 }}>⚠ Risks: </span>
                    <span style={{ color: '#94a3b8' }}>{cat.keyRisks.join(' · ')}</span>
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {cat.examples.map((ex, i) => (
                      <span key={i} style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem', background: 'rgba(249,115,22,0.12)', color: '#fdba74', border: '1px solid rgba(249,115,22,0.22)', borderRadius: 999 }}>{ex}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
