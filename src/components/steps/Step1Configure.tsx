import React, { useState } from 'react';
import { Settings2, Briefcase, AlertTriangle, Target, ChevronRight, Building2, FileText } from 'lucide-react';
import { INDUSTRIES_DATA } from '../../data/industries';
import { SENIORITY_LEVELS } from '../../data/seniority';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { cn } from '../../lib/utils';
import type { AppConfig } from '../../types';

interface Step1Props {
  config: AppConfig;
  onConfigChange: (config: AppConfig) => void;
  onNext: () => void;
}

export const Step1Configure: React.FC<Step1Props> = ({ config, onConfigChange, onNext }) => {
  const [touched, setTouched] = useState(false);

  const selectedIndustry = INDUSTRIES_DATA.find(i => i.industry === config.industry);
  const selectedSeniority = SENIORITY_LEVELS.find(s => s.id === config.seniorityId);

  const isValid =
    config.industry.trim() !== '' &&
    config.jobTitle.trim() !== '' &&
    config.seniorityId !== '';

  const industryOptions = INDUSTRIES_DATA.map(i => ({ value: i.industry, label: i.industry }));

  const handleNext = () => {
    setTouched(true);
    if (isValid) onNext();
  };

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

      <div className="space-y-6">

        {/* Industry Select */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              <CardTitle>Industry Sector</CardTitle>
            </div>
            <CardDescription>Select the primary industry for this training matrix.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              options={industryOptions}
              value={config.industry}
              onChange={v => onConfigChange({ ...config, industry: v })}
              placeholder="Select an industry..."
              error={touched && !config.industry ? 'Please select an industry.' : undefined}
            />

            {/* Focus + Risk badges */}
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

        {/* Job Title */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-purple-500" />
              <CardTitle>Job Title / Role</CardTitle>
            </div>
            <CardDescription>Specify the exact role this training matrix is designed for.</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="e.g., Drilling Floor Supervisor"
              value={config.jobTitle}
              onChange={e => onConfigChange({ ...config, jobTitle: e.target.value })}
              error={touched && !config.jobTitle.trim() ? 'Please enter a job title.' : undefined}
              hint="Be specific — this will be embedded directly into the AI prompt and the exported file."
            />
          </CardContent>
        </Card>

        {/* Seniority Layer */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-500" />
              <CardTitle>Seniority Layer</CardTitle>
            </div>
            <CardDescription>Choose the management level. This shapes the tone and cognitive depth of every scenario.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SENIORITY_LEVELS.map(level => {
                const isSelected = config.seniorityId === level.id;
                return (
                  <button
                    key={level.id}
                    onClick={() => onConfigChange({ ...config, seniorityId: level.id })}
                    className={cn(
                      'flex flex-col gap-2 p-4 rounded-xl border-2 text-left transition-all duration-150',
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn('text-2xl', level.id === 'entry' ? '🔧' : level.id === 'junior' ? '📊' : '🎯')}>
                        {level.id === 'entry' ? '🔧' : level.id === 'junior' ? '📊' : '🎯'}
                      </span>
                      <div className={cn('w-4 h-4 rounded-full border-2 transition-all', isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300')} />
                    </div>
                    <div>
                      <p className={cn('font-semibold text-sm', isSelected ? 'text-blue-700' : 'text-gray-700')}>
                        {level.label}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedSeniority && (
              <div className="mt-3 flex items-start gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                <span className="text-indigo-500 mt-0.5 flex-shrink-0">💡</span>
                <p className="text-xs text-indigo-700">
                  <strong>Tonal Frame:</strong> {selectedSeniority.tone}
                </p>
              </div>
            )}
            {touched && !config.seniorityId && (
              <p className="text-xs text-red-600 mt-2">Please select a seniority level.</p>
            )}
          </CardContent>
        </Card>

        {/* Policy Patching */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-500" />
              <CardTitle>Policy Patch <span className="text-gray-400 font-normal text-sm ml-1">(Optional)</span></CardTitle>
            </div>
            <CardDescription>
              Paste raw company policy text here. It will be injected into the AI prompt as a priority context layer, ensuring all scenarios align with your organisation's actual policies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={`Example:\n"All employees must complete mandatory HSE induction within 30 days of joining. Incident reporting must occur within 4 hours via the SafetyFirst portal. Supervisors are responsible for ensuring daily JSA completion before any field operation commences..."`}
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

        {/* Navigation */}
        <div className="flex justify-end pb-8">
          <Button
            size="lg"
            onClick={handleNext}
            className="min-w-48"
          >
            Next: Generate Prompt
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
