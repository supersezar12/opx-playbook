import React, { useState, useEffect } from 'react';
import {
  Settings2, Briefcase, AlertTriangle, Target,
  ChevronRight, Building2, FileText, Info,
} from 'lucide-react';
import { INDUSTRIES_DATA } from '../../data/industries';
import { SENIORITY_LEVELS } from '../../data/seniority';
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

function validate(config: AppConfig): Step1Errors {
  const errs: Step1Errors = {};
  if (!config.industry.trim())    errs.industry    = 'Please select an industry sector.';
  if (!config.jobTitle.trim())    errs.jobTitle    = 'Job title is required.';
  else if (config.jobTitle.trim().length < 3) errs.jobTitle = 'Job title must be at least 3 characters.';
  else if (config.jobTitle.trim().length > 120) errs.jobTitle = 'Job title must be 120 characters or fewer.';
  if (!config.seniorityId)        errs.seniorityId = 'Please select a seniority level.';
  return errs;
}

export const Step1Configure: React.FC<Step1Props> = ({ config, onConfigChange, onNext }) => {
  const [touched, setTouched] = useState({
    industry: false, jobTitle: false, seniorityId: false,
  });
  const [errors, setErrors] = useState<Step1Errors>({});

  const selectedIndustry = INDUSTRIES_DATA.find(i => i.industry === config.industry);
  const selectedSeniority = SENIORITY_LEVELS.find(s => s.id === config.seniorityId);

  // Re-validate live once any field has been touched
  useEffect(() => {
    if (Object.values(touched).some(Boolean)) {
      setErrors(validate(config));
    }
  }, [config, touched]);

  const industryOptions = INDUSTRIES_DATA.map(i => ({ value: i.industry, label: i.industry }));

  const touch = (field: keyof typeof touched) =>
    setTouched(t => ({ ...t, [field]: true }));

  const handleNext = () => {
    // Touch all fields to reveal all errors at once
    setTouched({ industry: true, jobTitle: true, seniorityId: true });
    const errs = validate(config);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    analytics.track('step_1_completed', {
      industry: config.industry,
      seniority: config.seniorityId,
      hasPolicy: config.policyText.trim().length > 0,
    });
    onNext();
  };

  const errorCount = Object.keys(errors).length;
  const allTouched = Object.values(touched).every(Boolean);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 step-transition">
      {/* Page header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-2xl mb-4">
          <Settings2 className="h-7 w-7 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Context Configurator</h1>
        <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
          Define the training context. These selections will be fused into a precision-crafted AI prompt in the next step.
        </p>
      </div>

      {/* Global validation banner (shown after first "Next" attempt) */}
      {allTouched && errorCount > 0 && (
        <Alert variant="danger" title={`${errorCount} field${errorCount > 1 ? 's' : ''} need attention`} className="mb-6">
          Please fix the highlighted fields below before continuing.
        </Alert>
      )}

      <div className="space-y-6">

        {/* ─── Industry Select ──────────────────────────── */}
        <Card className={cn(touched.industry && errors.industry ? 'border-red-300 ring-1 ring-red-300' : '')}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              <CardTitle>Industry Sector <RequiredStar /></CardTitle>
            </div>
            <CardDescription>Select the primary industry for this training matrix.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              options={industryOptions}
              value={config.industry}
              onChange={v => { onConfigChange({ ...config, industry: v }); touch('industry'); }}
              placeholder="Select an industry..."
              error={touched.industry ? errors.industry : undefined}
            />
            {selectedIndustry && (
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Target className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Core Focus Areas</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedIndustry.focuses.map((f, i) => (
                      <Badge key={i} variant="success">{f}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Key Risk Factors</span>
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

        {/* ─── Job Title ────────────────────────────────── */}
        <Card className={cn(touched.jobTitle && errors.jobTitle ? 'border-red-300 ring-1 ring-red-300' : '')}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-purple-500" />
              <CardTitle>Job Title / Role <RequiredStar /></CardTitle>
            </div>
            <CardDescription>Specify the exact role this training matrix is designed for.</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="e.g., Drilling Floor Supervisor"
              value={config.jobTitle}
              onChange={e => { onConfigChange({ ...config, jobTitle: e.target.value }); touch('jobTitle'); }}
              onBlur={() => touch('jobTitle')}
              error={touched.jobTitle ? errors.jobTitle : undefined}
              hint="Be specific — this is embedded directly into the AI prompt and the exported file."
            />
            <div className="flex justify-end mt-1">
              <span className={cn('text-xs', config.jobTitle.length > 100 ? 'text-amber-500' : 'text-gray-400')}>
                {config.jobTitle.length}/120
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ─── Seniority Layer ──────────────────────────── */}
        <Card className={cn(touched.seniorityId && errors.seniorityId ? 'border-red-300 ring-1 ring-red-300' : '')}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-500" />
              <CardTitle>Seniority Layer <RequiredStar /></CardTitle>
            </div>
            <CardDescription>
              Choose the management level. This shapes the tone and cognitive depth of every scenario.
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
                    className={cn(
                      'flex flex-col gap-2 p-4 rounded-xl border-2 text-left transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400',
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/40',
                    )}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{emoji}</span>
                      <div className={cn(
                        'w-4 h-4 rounded-full border-2 transition-all flex-shrink-0',
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300',
                      )} />
                    </div>
                    <p className={cn('font-semibold text-sm', isSelected ? 'text-blue-700' : 'text-gray-700')}>
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
                <span>⚠</span> {errors.seniorityId}
              </p>
            )}
          </CardContent>
        </Card>

        {/* ─── Policy Patching (optional) ───────────────── */}
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
              Paste raw company policy text. It will be injected into the AI prompt as a priority context layer so all scenarios align with your organisation's actual policies.
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

        {/* ─── Navigation ───────────────────────────────── */}
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
