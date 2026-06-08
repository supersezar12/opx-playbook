import React, { useState, useEffect } from 'react';
import {
  Settings2, Briefcase, AlertTriangle, Target, ChevronRight,
  Building2, FileText, Info, LayoutGrid, Sparkles,
} from 'lucide-react';
import { INDUSTRIES_DATA }        from '../../data/industries';
import { DEPARTMENTS_DATA }       from '../../data/departments';
import { SENIORITY_LEVELS }       from '../../data/seniority';
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
  if (!config.industry.trim()) e.industry = 'Please select an industry sector.';
  if (!config.jobTitle.trim()) e.jobTitle = 'Job title is required.';
  else if (config.jobTitle.trim().length < 3) e.jobTitle = 'Must be at least 3 characters.';
  else if (config.jobTitle.trim().length > 120) e.jobTitle = 'Must be 120 characters or fewer.';
  if (!config.seniorityId) e.seniorityId = 'Please select a seniority level.';
  return e;
}

const SENIORITY_ICONS: Record<string, string> = { entry: '🔧', junior: '📊', senior: '🎯' };

export const Step1Configure: React.FC<Step1Props> = ({ config, onConfigChange, onNext }) => {
  const [touched, setTouched] = useState({ industry: false, department: false, jobTitle: false, seniorityId: false });
  const [errors, setErrors]   = useState<Step1Errors>({});

  const selectedIndustry  = INDUSTRIES_DATA.find(i => i.industry === config.industry);
  const selectedSeniority = SENIORITY_LEVELS.find(s => s.id === config.seniorityId);
  const industryDepts     = DEPARTMENTS_DATA.find(d => d.industry === config.industry)?.departments ?? [];
  const selectedDept      = industryDepts.find(d => d.id === config.department) ?? null;

  useEffect(() => {
    if (Object.values(touched).some(Boolean)) setErrors(validate(config));
  }, [config, touched]);

  const touch = (f: keyof typeof touched) => setTouched(t => ({ ...t, [f]: true }));

  const handleIndustryChange = (v: string) => {
    onConfigChange({ ...config, industry: v, department: '', productCategories: [] });
    touch('industry');
  };

  const isDistribution = config.industry === 'Distribution Company';

  const toggleCategory = (id: string) => {
    const current = config.productCategories ?? [];
    const updated = current.includes(id)
      ? current.filter(c => c !== id)
      : [...current, id];
    onConfigChange({ ...config, productCategories: updated });
  };

  const handleNext = () => {
    setTouched({ industry: true, department: true, jobTitle: true, seniorityId: true });
    const errs = validate(config);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    analytics.track('step_1_completed', { industry: config.industry, department: config.department || '(none)', productCategories: (config.productCategories ?? []).join(',') || '(none)', seniority: config.seniorityId, hasPolicy: config.policyText.trim().length > 0 });
    onNext();
  };

  const errorCount = Object.keys(errors).length;
  const allTouched = touched.industry && touched.jobTitle && touched.seniorityId;
  const titlePlaceholder = selectedDept?.typicalRoles.slice(0, 2).join(', ') ?? 'e.g., Drilling Floor Supervisor';

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 step-transition">

      {/* ── Page header ── */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 relative">
          <div className="absolute inset-0 rounded-2xl bg-amber-500/20 blur-md" />
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border border-amber-500/30 flex items-center justify-center">
            <Settings2 className="h-6 w-6 text-amber-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Context Configurator</h1>
        <p className="text-slate-400 mt-2 text-sm max-w-sm mx-auto leading-relaxed">
          Define the training context — industry, department, role and seniority are all fused into the AI prompt.
        </p>
      </div>

      {/* Global error banner */}
      {allTouched && errorCount > 0 && (
        <Alert variant="danger" title={`${errorCount} field${errorCount > 1 ? 's' : ''} need attention`} className="mb-6">
          Fix the highlighted fields below to continue.
        </Alert>
      )}

      <div className="space-y-4">

        {/* ── INDUSTRY ── */}
        <Card className={cn(touched.industry && errors.industry ? 'border-red-500/40' : '')}>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-3.5 w-3.5 text-blue-400" />
              </div>
              <div>
                <CardTitle>Industry Sector <Star /></CardTitle>
                <CardDescription>Primary industry for this training matrix.</CardDescription>
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

        {/* ── DEPARTMENT ── */}
        <Card className={cn(!config.industry ? 'opacity-40 pointer-events-none' : '')}>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/25 flex items-center justify-center flex-shrink-0">
                <LayoutGrid className="h-3.5 w-3.5 text-violet-400" />
              </div>
              <div>
                <CardTitle>Department <span className="text-slate-600 font-normal text-xs ml-1">(Optional)</span></CardTitle>
                <CardDescription>Narrow scope to a specific department within {config.industry || 'the industry'}.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {industryDepts.length === 0 ? (
              <p className="text-sm text-slate-600 italic">Select an industry to see departments.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {industryDepts.map(dept => {
                    const isSel = config.department === dept.id;
                    return (
                      <button
                        key={dept.id}
                        onClick={() => { onConfigChange({ ...config, department: isSel ? '' : dept.id }); touch('department'); }}
                        aria-pressed={isSel}
                        className={cn(
                          'flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all duration-200',
                          'focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60',
                          isSel
                            ? 'border-violet-500/50 bg-violet-500/10'
                            : 'border-white/8 bg-white/2 hover:border-white/16 hover:bg-white/5',
                        )}
                      >
                        <span className="text-lg flex-shrink-0 mt-0.5 leading-none">{dept.emoji}</span>
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
                  <div className="mt-4 p-4 rounded-xl border border-violet-500/25 bg-violet-500/8 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{selectedDept.emoji}</span>
                      <span className="font-semibold text-sm text-violet-300">{selectedDept.name}</span>
                      <Badge variant="violet" className="ml-auto">Selected</Badge>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Sparkles className="h-3 w-3 text-violet-400" />
                        <span className="text-xs font-semibold text-violet-500 uppercase tracking-wider">Sub-Focuses → Injected into prompt</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedDept.subFocuses.map((sf, i) => <Badge key={i} variant="violet">{sf}</Badge>)}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Briefcase className="h-3 w-3 text-slate-500" />
                        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Typical Roles</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedDept.typicalRoles.map((r, i) => <Badge key={i} variant="outline">{r}</Badge>)}
                      </div>
                    </div>
                  </div>
                )}

                {config.department && (
                  <button onClick={() => onConfigChange({ ...config, department: '' })}
                    className="mt-2 text-xs text-slate-600 hover:text-red-400 transition-colors flex items-center gap-1">
                    ✕ Clear department
                  </button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* ── JOB TITLE ── */}
        <Card className={cn(touched.jobTitle && errors.jobTitle ? 'border-red-500/40' : '')}>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center flex-shrink-0">
                <Briefcase className="h-3.5 w-3.5 text-purple-400" />
              </div>
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
              hint="Embedded directly into the AI prompt and the exported file."
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
              <span className={cn('text-xs', config.jobTitle.length > 100 ? 'text-amber-400' : 'text-slate-600')}>
                {config.jobTitle.length}/120
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ── SENIORITY ── */}
        <Card className={cn(touched.seniorityId && errors.seniorityId ? 'border-red-500/40' : '')}>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center flex-shrink-0">
                <Target className="h-3.5 w-3.5 text-indigo-400" />
              </div>
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
                    className={cn(
                      'flex flex-col gap-2.5 p-4 rounded-xl border text-left transition-all duration-200',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60',
                      isSel ? 'border-amber-500/40 bg-amber-500/8' : 'border-white/8 bg-white/2 hover:border-white/16 hover:bg-white/5',
                    )}>
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
            {touched.seniorityId && errors.seniorityId && (
              <p className="text-xs text-red-400 mt-2">⚠ {errors.seniorityId}</p>
            )}
          </CardContent>
        </Card>

        {/* ── PRODUCT CATEGORIES (Distribution Company only) ── */}
        {isDistribution && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/25 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">🛒</span>
                </div>
                <div>
                  <CardTitle>
                    Product Categories
                    <span className="text-slate-600 font-normal text-xs ml-2">(Optional — select all that apply)</span>
                  </CardTitle>
                  <CardDescription>
                    Select the product portfolio handled. Each category's temperature, shelf life and handling requirements are injected into the AI prompt.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRODUCT_CATEGORIES_DATA.map(cat => {
                  const isSel = (config.productCategories ?? []).includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      aria-pressed={isSel}
                      className={cn(
                        'flex items-start gap-2 p-3 rounded-xl border text-left transition-all duration-150',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60',
                        isSel
                          ? 'border-orange-500/50 bg-orange-500/10'
                          : 'border-white/8 bg-white/2 hover:border-white/16 hover:bg-white/5',
                      )}
                    >
                      <span className="text-lg flex-shrink-0 leading-none mt-0.5">{cat.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className={cn('font-medium text-sm leading-tight', isSel ? 'text-orange-300' : 'text-slate-300')}>
                          {cat.name}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5 leading-snug">{cat.tempRange}</p>
                      </div>
                      <div className={cn(
                        'w-3.5 h-3.5 rounded border-2 flex-shrink-0 mt-0.5 transition-all',
                        isSel ? 'border-orange-400 bg-orange-400' : 'border-slate-600',
                      )} />
                    </button>
                  );
                })}
              </div>

              {/* Selected category detail cards */}
              {(config.productCategories ?? []).length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Selected Category Details — injected into AI prompt:
                  </p>
                  {PRODUCT_CATEGORIES_DATA
                    .filter(cat => (config.productCategories ?? []).includes(cat.id))
                    .map(cat => (
                      <div key={cat.id} className="rounded-xl border border-orange-500/20 bg-orange-500/6 p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base">{cat.emoji}</span>
                          <span className="font-semibold text-sm text-orange-300">{cat.name}</span>
                          <span className="text-xs text-orange-500 ml-auto">{cat.tempRange}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-500 font-medium">Shelf Life: </span>
                            <span className="text-slate-400">{cat.shelfLife}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium">Key Risks: </span>
                            <span className="text-slate-400">{cat.keyRisks.join(' · ')}</span>
                          </div>
                        </div>
                        <div className="mt-1.5 text-xs">
                          <span className="text-slate-500 font-medium">Examples: </span>
                          <span className="text-slate-500">{cat.examples.join(', ')}</span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {cat.examples.slice(0, 5).map((ex, i) => (
                            <span key={i} className="text-xs px-1.5 py-0.5 bg-orange-500/15 text-orange-400 border border-orange-500/20 rounded-full">{ex}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  <button
                    onClick={() => onConfigChange({ ...config, productCategories: [] })}
                    className="text-xs text-slate-600 hover:text-red-400 transition-colors flex items-center gap-1 mt-1"
                  >
                    ✕ Clear all categories
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── POLICY PATCH ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-teal-500/15 border border-teal-500/25 flex items-center justify-center flex-shrink-0">
                <FileText className="h-3.5 w-3.5 text-teal-400" />
              </div>
              <div>
                <CardTitle>Policy Patch <span className="text-slate-600 font-normal text-xs ml-1">(Optional)</span></CardTitle>
                <CardDescription>Company policy injected as a priority context layer into the AI prompt.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={`"All employees must complete mandatory HSE induction within 30 days..."`}
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

        {/* ── NAVIGATION ── */}
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

const Star = () => <span className="text-amber-500 ml-0.5 text-xs" aria-label="required">*</span>;
