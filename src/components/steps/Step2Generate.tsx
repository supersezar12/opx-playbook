import React, { useState, useEffect } from 'react';
import {
  Copy, Check, Download, ChevronRight, ChevronLeft,
  Wand2, Building2, User, Layers, FileText, AlertCircle,
} from 'lucide-react';
import { INDUSTRIES_DATA } from '../../data/industries';
import { SENIORITY_LEVELS } from '../../data/seniority';
import { Button }   from '../ui/Button';
import { Badge }    from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Alert }    from '../ui/Alert';
import { buildExecutionPrompt } from '../../lib/promptEngine';
import { analytics } from '../../lib/analytics';
import type { AppConfig } from '../../types';

interface Step2Props {
  config: AppConfig;
  onBack: () => void;
  onNext: () => void;
}

export const Step2Generate: React.FC<Step2Props> = ({ config, onBack, onNext }) => {
  const [copied, setCopied]   = useState(false);
  const [copyError, setCopyError] = useState('');
  const [prompt, setPrompt]   = useState('');
  const [downloadDone, setDownloadDone] = useState(false);

  useEffect(() => { setPrompt(buildExecutionPrompt(config)); }, [config]);

  const selectedIndustry  = INDUSTRIES_DATA.find(i => i.industry === config.industry);
  const selectedSeniority = SENIORITY_LEVELS.find(s => s.id === config.seniorityId);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setCopyError('');
      analytics.track('step_2_prompt_copied');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopyError('Clipboard access denied. Please select and copy the text manually.');
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([prompt], { type: 'text/plain;charset=utf-8' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `OPX_Prompt_${config.industry.replace(/\W+/g, '_')}_${config.jobTitle.replace(/\W+/g, '_')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloadDone(true);
      analytics.track('step_2_prompt_downloaded');
      setTimeout(() => setDownloadDone(false), 2500);
    } catch {
      setCopyError('Download failed. Please try copying the text manually.');
    }
  };

  const handleNext = () => {
    analytics.track('step_2_completed', { industry: config.industry });
    onNext();
  };

  const wordCount = prompt.split(/\s+/).filter(Boolean).length;
  const charCount = prompt.length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 step-transition">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-100 rounded-2xl mb-4">
          <Wand2 className="h-7 w-7 text-purple-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Prompt Factory</h1>
        <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
          Your execution prompt has been assembled. Copy it and paste into any capable AI (GPT-4o, Claude, Gemini) to generate the training JSON.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Config Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Summary</CardTitle>
              <CardDescription>What was used to build this prompt.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SummaryRow icon={<Building2 className="h-4 w-4 text-blue-600" />} bg="bg-blue-100"
                label="Industry" value={config.industry} />
              <SummaryRow icon={<User className="h-4 w-4 text-purple-600" />} bg="bg-purple-100"
                label="Job Title" value={config.jobTitle} />
              <SummaryRow icon={<Layers className="h-4 w-4 text-indigo-600" />} bg="bg-indigo-100"
                label="Seniority" value={selectedSeniority?.label ?? '—'}
                sub={selectedSeniority?.tone} />
              {config.policyText.trim() && (
                <SummaryRow icon={<FileText className="h-4 w-4 text-teal-600" />} bg="bg-teal-100"
                  label="Policy Patch"
                  value={`✓ ${config.policyText.trim().split(/\s+/).length} words injected`}
                  valueClass="text-emerald-700" />
              )}
              {selectedIndustry && (
                <>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-2">Focus Areas Embedded</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedIndustry.focuses.map((f, i) => (
                        <Badge key={i} variant="success" className="text-xs">{f}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-2">Risk Contexts Embedded</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedIndustry.risks.map((r, i) => (
                        <Badge key={i} variant="warning" className="text-xs">{r}</Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Prompt stats */}
          <Card>
            <CardContent className="py-4">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xl font-bold text-blue-600">{wordCount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Words</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xl font-bold text-purple-600">{charCount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Characters</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert variant="info" title="How to Use">
            <ol className="text-xs space-y-1.5 mt-1 list-decimal list-inside">
              <li>Copy the prompt using the button.</li>
              <li>Open GPT-4o, Claude 3.5 Sonnet, or Gemini 1.5 Pro.</li>
              <li>Start a fresh conversation and paste the prompt.</li>
              <li>Wait for the full JSON output (may take 1–3 min).</li>
              <li>Come back and paste the JSON in Step 3.</li>
            </ol>
          </Alert>
        </div>

        {/* Right: Prompt Display */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="flex-1">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle>Generated Execution Prompt</CardTitle>
                  <CardDescription>Read-only. Copy or download to use with your AI of choice.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleDownload}
                    className={downloadDone ? 'border-emerald-400 text-emerald-700' : ''}>
                    {downloadDone ? <Check className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
                    {downloadDone ? 'Downloaded!' : 'Download .txt'}
                  </Button>
                  <Button size="sm" onClick={handleCopy} variant={copied ? 'success' : 'default'}>
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copied!' : 'Copy Prompt'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {copyError && (
                <div className="px-6 pb-4">
                  <Alert variant="warning">
                    <AlertCircle className="h-4 w-4" />{copyError}
                  </Alert>
                </div>
              )}
              <div className="relative bg-gray-950 rounded-b-2xl overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-900 border-b border-gray-800">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="ml-2 text-xs text-gray-500 font-mono">opx_execution_prompt.txt</span>
                </div>
                <pre className="code-block text-gray-300 p-5 overflow-auto max-h-[520px] whitespace-pre-wrap break-words leading-relaxed text-xs">
                  {prompt}
                </pre>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack}>
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <Button size="lg" onClick={handleNext} className="min-w-48">
              Next: Ingest JSON
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Helper ───────────────────────────────────────────────────────────────────
const SummaryRow: React.FC<{
  icon: React.ReactNode; bg: string;
  label: string; value: string; sub?: string; valueClass?: string;
}> = ({ icon, bg, label, value, sub, valueClass }) => (
  <div className="flex items-start gap-3">
    <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className={`text-sm font-semibold text-gray-900 ${valueClass ?? ''}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5 italic">{sub}</p>}
    </div>
  </div>
);
