import React, { useState, useEffect } from 'react';
import {
  Settings2, Briefcase, AlertTriangle, Target, ChevronRight,
  Building2, FileText, Info, LayoutGrid, Sparkles,
} from 'lucide-react';
import { INDUSTRIES_DATA }   from '../../data/industries';
import { DEPARTMENTS_DATA }  from '../../data/departments';
import { SENIORITY_LEVELS }  from '../../data/seniority';
import { Button }      from '../ui/Button';
import { Badge }       from '../ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Select }      from '../ui/Select';
import { Input }       from '../ui/Input';
import { Textarea }    from '../ui/Textarea';
import { Alert }       from '../ui/Alert';
import { cn }          from '../../lib/utils';
import { analytics }   from '../../lib/analytics';
import type { AppConfig, Step1Errors } from '../../types';

interface Step1Props {
  config: AppConfig;
  onConfigChange: (config: AppConfig) => void;
  onNext: () => void;
}

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(config: AppConfig): Step1Errors {
  const errs: Step1Errors = {};
  if (!config.industry.trim())
    errs.industry = 'Please select an industry sector.';
  if (!config.jobTitle.trim())
    errs.jobTitle = 'Job title is required.';
  else if (config.jobTitle.trim().length < 3)
    errs.jobTitle = 'Job title must be at least 3 characters.';
  else if (config.jobTitle.trim().length > 120)
    errs.jobTitle = 'Job title must be 120 characters or fewer.';
  if (!config.seniorityId)
    errs.seniorityId = 'Please select a seniority level.';
  return errs;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const Step1Configure: React.FC<Step1Props> = ({ config, onConfigChange, onNext }) => {
  const [touched, setTouched] = useState({
    industry: false, department: false, jobTitle: false, seniorityId: false,
  });
  const [errors, setErrors] = useState<Step1Errors>({});

  // Derived data
  const selectedIndustry  = INDUSTRIES_DATA.find(i => i.industry === config.industry);
  const selectedSeniority = SENIORITY_LEVELS.find(s => s.id === config.seniorityId);
  const industryDepts     = DEPARTMENTS_DATA.find(d => d.industry === config.industry)?.departments ?? [];
  const selectedDept      = industryDepts.find(d => d.id === config.department) ?? null;

  // Live re-validate once any field touched
  useEffect(() => {
    if (Object.values(touched).some(Boolean)) setErrors(validate(config));
  }, [config, touched]);

  // When industry changes, clear department
  const handleIndustryChange = (v: string) => {
    onConfigChange({ ...config, industry: v, department: '' });
    touch('industry');
  };

  // When department is selected, auto-suggest a job title hint if field is empty
  const handleDeptChange = (deptId: string) => {
    const dept = industryDepts.find(d => d.id === deptId);
    onConfigChange({
      ...config,
      department: deptId,
      // Auto-fill job title placeholder suggestion (not the value itself)
    });
    touch('department');
    void dept; // used in placeholder below
  };

  const touch = (field: keyof typeof touched) =>
    setTouched(t => ({ ...t, [field]: true }));

  const handleNext = () => {
    setTouched({ industry: true, department: true, jobTitle: true, seniorityId: true });
    const errs = validate(config);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    analytics.track('step_1_completed', {
      industry:   config.industry,
      department: config.department || '(none)',
      seniority:  config.seniorityId,
      hasPolicy:  config.policyText.trim().length > 0,
    });
    onNext();
  };

  const errorCount = Object.keys(errors).length;
  const allTouched = touched.industry && touched.jobTitle && touched.seniorityId;

  // Job title placeholder: use typical roles from selected dept if available
  const titlePlaceholder = selectedDept?.typicalRoles.slice(0, 2).join(', ') ??
    'e.g., Drilling Floor Supervisor';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 step-transition">

      {/* Page header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-2xl mb-4">
          <Settings2 className="h-7 w-7 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Context Configurator</h1>
        <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
          Define the training context. Industry → Department → Role is fused into a
          precision-crafted AI prompt in the next step.
        </p>
      </div>

      {/* Global error banner */}
      {allTouched && errorCount > 0 && (
        <Alert variant="danger"
          title={`${errorCount} field${errorCount > 1 ? 's' : ''} need attention`}
          className="mb-6">
          Please fix the highlighted fields below before continuing.
        </Alert>
      )}

      <div className="space-y-6">

        {/* ── INDUSTRY ──────────────────────────────────────────────────────── */}
        <Card className={cn(touched.industry && errors.industry
          ? 'border-red-300 ring-1 ring-red-300' : '')}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              <CardTitle>Industry Sector <RequiredStar /></CardTitle>
            </div>
            <CardDescription>Select the primary industry for this training matrix.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              options={INDUSTRIES_DATA.map(i => ({ value: i.industry, label: i.industry }))}
              value={config.industry}
              onChange={handleIndustryChange}
              placeholder="Select an industry..."
              error={touched.industry ? errors.industry : undefined}
            />

            {/* Industry focus + risk badges */}
            {selectedIndustry && (
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Target className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Core Focus Areas
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedIndustry.focuses.map((f, i) => (
                      <Badge key={i} variant="success">{f}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Key Risk Factors
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedIndustry.risks.map((r, i) => (
                      <Badge key={i} variant="warning">{r}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── DEPARTMENT ────────────────────────────────────────────────────── */}
        <Card className={cn(
          !config.industry ? 'opacity-50 pointer-events-none' : '',
          touched.department && errors.department ? 'border-red-300 ring-1 ring-red-300' : ''
        )}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-violet-500" />
              <CardTitle>Department
                <span className="text-gray-400 font-normal text-sm ml-2">(Optional)</span>
              </CardTitle>
            </div>
            <CardDescription>
              Narrow the training to a specific department within{' '}
              <strong>{config.industry || 'the selected industry'}</strong>.
              This adds department-specific sub-focuses to the AI prompt.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {industryDepts.length === 0 ? (
              <p className="text-sm text-gray-400 italic">
                Select an industry above to see available departments.
              </p>
            ) : (
              <>
                {/* Department grid cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {industryDepts.map(dept => {
                    const isSelected = config.department === dept.id;
                    return (
                      <button
                        key={dept.id}
                        onClick={() => handleDeptChange(isSelected ? '' : dept.id)}
                        className={cn(
                          'flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-150',
                          'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-violet-400',
                          isSelected
                            ? 'border-violet-500 bg-violet-50 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50/30',
                        )}
                        aria-pressed={isSelected}
                      >
                        <span className="text-xl flex-shrink-0 mt-0.5">{dept.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'font-semibold text-sm leading-tight',
                            isSelected ? 'text-violet-800' : 'text-gray-800',
                          )}>
                            {dept.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {dept.typicalRoles.slice(0, 3).join(' · ')}
                          </p>
                        </div>
                        <div className={cn(
                          'w-4 h-4 rounded-full border-2 flex-shrink-0 mt-1 transition-all',
                          isSelected ? 'border-violet-500 bg-violet-500' : 'border-gray-300',
                        )} />
                      </button>
                    );
                  })}
                </div>

                {/* Selected department detail */}
                {selectedDept && (
                  <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{selectedDept.emoji}</span>
                      <span className="font-semibold text-violet-900">{selectedDept.name}</span>
                      <Badge variant="info" className="ml-auto">Selected</Badge>
                    </div>

                    {/* Sub-focuses */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-violet-600" />
                        <span className="text-xs font-semibold text-violet-700 uppercase tracking-wide">
                          Department Sub-Focuses (injected into prompt)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedDept.subFocuses.map((sf, i) => (
                          <Badge key={i} variant="info">{sf}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Typical roles */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-violet-600" />
                        <span className="text-xs font-semibold text-violet-700 uppercase tracking-wide">
                          Typical Roles
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedDept.typicalRoles.map((r, i) => (
                          <Badge key={i} variant="outline">{r}</Badge>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-violet-700 flex items-center gap-1.5 pt-1">
                      <Info className="h-3.5 w-3.5 flex-shrink-0" />
                      Department sub-focuses will be added as a priority layer in the AI prompt,
                      focusing all 60 stages on this department's real workflows.
                    </p>
                  </div>
                )}

                {/* Clear selection button */}
                {config.department && (
                  <button
                    onClick={() => onConfigChange({ ...config, department: '' })}
                    className="mt-2 text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                  >
                    ✕ Clear department selection
                  </button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* ── JOB TITLE ─────────────────────────────────────────────────────── */}
        <Card className={cn(touched.jobTitle && errors.jobTitle
          ? 'border-red-300 ring-1 ring-red-300' : '')}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-purple-500" />
              <CardTitle>Job Title / Role <RequiredStar /></CardTitle>
            </div>
            <CardDescription>
              The exact role this matrix is designed for
              {selectedDept ? ` within ${selectedDept.name}` : ''}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder={titlePlaceholder}
              value={config.jobTitle}
              onChange={e => { onConfigChange({ ...config, jobTitle: e.target.value }); touch('jobTitle'); }}
              onBlur={() => touch('jobTitle')}
              error={touched.jobTitle ? errors.jobTitle : undefined}
              hint="Be specific — embedded directly into the AI prompt and exported file."
            />
            <div className="flex items-center justify-between mt-1.5 flex-wrap gap-2">
              {/* Quick-fill typical role pills */}
              {selectedDept && selectedDept.typicalRoles.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedDept.typicalRoles.map((role, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        onConfigChange({ ...config, jobTitle: role });
                        touch('jobTitle');
                      }}
                      className="text-xs px-2 py-0.5 rounded-full border border-violet-200 bg-violet-50
                        text-violet-700 hover:bg-violet-100 hover:border-violet-300 transition-colors"
                    >
                      {role}
                    </button>
                  ))}
                </div>
              )}
              <span className={cn(
                'text-xs ml-auto',
                config.jobTitle.length > 100 ? 'text-amber-500' : 'text-gray-400',
              )}>
                {config.jobTitle.length}/120
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ── SENIORITY ─────────────────────────────────────────────────────── */}
        <Card className={cn(touched.seniorityId && errors.seniorityId
          ? 'border-red-300 ring-1 ring-red-300' : '')}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-500" />
              <CardTitle>Seniority Layer <RequiredStar /></CardTitle>
            </div>
            <CardDescription>
              Choose the management level — shapes the tone and cognitive depth of every scenario.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SENIORITY_LEVELS.map(level => {
                const isSelected = config.seniorityId === level.id;
                const emoji = level.id === 'entry' ? '🔧' : level.id === 'junior' ? '📊' : '🎯';
                return (
                  <button
                    key={level.id}
                    onClick={() => { onConfigChange({ ...config, seniorityId: level.id }); touch('seniorityId'); }}
                    aria-pressed={isSelected}
                    className={cn(
                      'flex flex-col gap-2 p-4 rounded-xl border-2 text-left transition-all duration-150',
                      'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400',
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/40',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{emoji}</span>
                      <div className={cn(
                        'w-4 h-4 rounded-full border-2 transition-all flex-shrink-0',
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300',
                      )} />
                    </div>
                    <p className={cn(
                      'font-semibold text-sm',
                      isSelected ? 'text-blue-700' : 'text-gray-700',
                    )}>
                      {level.label}
                    </p>
                  </button>
                );
              })}
            </div>

            {selectedSeniority && (
              <div className="mt-3 flex items-start gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                <Info className="h-4 w-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-700">
                  <strong>Tonal Frame:</strong> {selectedSeniority.tone}
                </p>
              </div>
            )}

            {touched.seniorityId && errors.seniorityId && (
              <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                ⚠ {errors.seniorityId}
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── POLICY PATCH ──────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-500" />
              <CardTitle>
                Policy Patch
                <span className="text-gray-400 font-normal text-sm ml-2">(Optional)</span>
              </CardTitle>
            </div>
            <CardDescription>
              Paste raw company policy text. Injected as a priority context layer in the AI prompt,
              ensuring all scenarios align with your organisation's actual policies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={`Example:\n"All employees must complete mandatory HSE induction within 30 days of joining. Incident reporting must occur within 4 hours via the SafetyFirst portal..."`}
              value={config.policyText}
              onChange={e => onConfigChange({ ...config, policyText: e.target.value })}
              rows={6}
              className="font-mono text-xs"
            />
            {config.policyText.trim() && (
              <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                ✓ {config.policyText.trim().split(/\s+/).length} words will be injected into the prompt.
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── NAVIGATION ────────────────────────────────────────────────────── */}
        <div className="flex justify-end pb-8">
          <Button size="lg" onClick={handleNext} className="min-w-48">
            Next: Generate Prompt
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

      </div>
    </div>
  );
};

const RequiredStar = () => (
  <span className="text-red-500 ml-0.5" aria-label="required">*</span>
);
