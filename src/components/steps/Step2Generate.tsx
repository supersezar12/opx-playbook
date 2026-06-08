import React, { useState, useEffect } from 'react';
import {
  Copy, Check, Download, ChevronRight, ChevronLeft,
  Wand2, Building2, User, Layers, FileText, AlertCircle, LayoutGrid,
} from 'lucide-react';
import { INDUSTRIES_DATA }  from '../../data/industries';
import { DEPARTMENTS_DATA } from '../../data/departments';
import { SENIORITY_LEVELS } from '../../data/seniority';
import { Button }    from '../ui/Button';
import { Badge }     from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Alert }     from '../ui/Alert';
import { buildExecutionPrompt } from '../../lib/promptEngine';
import { analytics } from '../../lib/analytics';
import type { AppConfig } from '../../types';

interface Step2Props { config: AppConfig; onBack: () => void; onNext: () => void; }

export const Step2Generate: React.FC<Step2Props> = ({ config, onBack, onNext }) => {
  const [copied, setCopied]         = useState(false);
  const [copyError, setCopyError]   = useState('');
  const [prompt, setPrompt]         = useState('');
  const [dlDone, setDlDone]         = useState(false);

  useEffect(() => { setPrompt(buildExecutionPrompt(config)); }, [config]);

  const selectedIndustry  = INDUSTRIES_DATA.find(i => i.industry === config.industry);
  const selectedSeniority = SENIORITY_LEVELS.find(s => s.id === config.seniorityId);
  const industryDepts     = DEPARTMENTS_DATA.find(d => d.industry === config.industry)?.departments ?? [];
  const selectedDept      = industryDepts.find(d => d.id === config.department) ?? null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true); setCopyError('');
      analytics.track('step_2_prompt_copied');
      setTimeout(() => setCopied(false), 2500);
    } catch { setCopyError('Clipboard access denied — please select and copy manually.'); }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([prompt], { type: 'text/plain;charset=utf-8' });
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `OPX_Prompt_${config.industry.replace(/\W+/g,'_')}.txt` });
      a.click(); URL.revokeObjectURL(a.href);
      setDlDone(true); analytics.track('step_2_prompt_downloaded');
      setTimeout(() => setDlDone(false), 2500);
    } catch { setCopyError('Download failed.'); }
  };

  const handleNext = () => { analytics.track('step_2_completed', { industry: config.industry }); onNext(); };

  const wordCount = prompt.split(/\s+/).filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 step-transition">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 relative">
          <div className="absolute inset-0 rounded-2xl bg-purple-500/20 blur-md" />
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-600/10 border border-purple-500/30 flex items-center justify-center">
            <Wand2 className="h-6 w-6 text-purple-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Prompt Factory</h1>
        <p className="text-slate-400 mt-2 text-sm max-w-md mx-auto">Copy the generated prompt and paste into GPT-4o, Claude, or Gemini to get your training JSON.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>What's baked into this prompt.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5">
              <SRow icon={<Building2 className="h-3.5 w-3.5 text-blue-400"/>} bg="bg-blue-500/15" label="Industry" value={config.industry}/>
              {selectedDept && <SRow icon={<LayoutGrid className="h-3.5 w-3.5 text-violet-400"/>} bg="bg-violet-500/15" label="Department" value={`${selectedDept.emoji} ${selectedDept.name}`}/>}
              <SRow icon={<User className="h-3.5 w-3.5 text-purple-400"/>} bg="bg-purple-500/15" label="Job Title" value={config.jobTitle}/>
              <SRow icon={<Layers className="h-3.5 w-3.5 text-indigo-400"/>} bg="bg-indigo-500/15" label="Seniority" value={selectedSeniority?.label ?? '—'} sub={selectedSeniority?.tone}/>
              {config.policyText.trim() && <SRow icon={<FileText className="h-3.5 w-3.5 text-teal-400"/>} bg="bg-teal-500/15" label="Policy Patch" value={`✓ ${config.policyText.trim().split(/\s+/).length} words injected`} valueClass="text-emerald-400"/>}
              {selectedIndustry && (
                <>
                  <div><p className="text-xs text-slate-600 font-medium mb-1.5">Focus Areas</p><div className="flex flex-wrap gap-1">{selectedIndustry.focuses.map((f,i)=><Badge key={i} variant="success" className="text-xs">{f}</Badge>)}</div></div>
                  {selectedDept && <div><p className="text-xs text-slate-600 font-medium mb-1.5">Dept Sub-Focuses</p><div className="flex flex-wrap gap-1">{selectedDept.subFocuses.map((sf,i)=><Badge key={i} variant="violet" className="text-xs">{sf}</Badge>)}</div></div>}
                  <div><p className="text-xs text-slate-600 font-medium mb-1.5">Risk Contexts</p><div className="flex flex-wrap gap-1">{selectedIndustry.risks.map((r,i)=><Badge key={i} variant="warning" className="text-xs">{r}</Badge>)}</div></div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl bg-white/3 border border-white/6 p-3">
                  <p className="text-xl font-bold text-amber-400">{wordCount.toLocaleString()}</p>
                  <p className="text-xs text-slate-600 mt-0.5">Words</p>
                </div>
                <div className="rounded-xl bg-white/3 border border-white/6 p-3">
                  <p className="text-xl font-bold text-purple-400">{prompt.length.toLocaleString()}</p>
                  <p className="text-xs text-slate-600 mt-0.5">Characters</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert variant="info" title="How to use">
            <ol className="text-xs space-y-1 mt-1 list-decimal list-inside text-slate-400">
              <li>Copy the prompt below.</li>
              <li>Open GPT-4o, Claude 3.5, or Gemini 1.5 Pro.</li>
              <li>Paste into a fresh conversation.</li>
              <li>Wait for the full JSON (1–3 min).</li>
              <li>Return and paste JSON in Step 3.</li>
            </ol>
          </Alert>
        </div>

        {/* Right: Prompt */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="flex-1">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle>Generated Execution Prompt</CardTitle>
                  <CardDescription>Read-only — copy or download to use.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleDownload} className={dlDone ? 'border-emerald-500/40 text-emerald-400' : ''}>
                    {dlDone ? <Check className="h-3.5 w-3.5"/> : <Download className="h-3.5 w-3.5"/>}
                    {dlDone ? 'Downloaded!' : 'Download .txt'}
                  </Button>
                  <Button size="sm" variant={copied ? 'success' : 'default'} onClick={handleCopy}>
                    {copied ? <Check className="h-3.5 w-3.5"/> : <Copy className="h-3.5 w-3.5"/>}
                    {copied ? 'Copied!' : 'Copy Prompt'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {copyError && <div className="px-6 pb-4"><Alert variant="warning"><AlertCircle className="h-4 w-4"/>{copyError}</Alert></div>}
              <div className="bg-gray-950 rounded-b-2xl overflow-hidden border-t border-white/6">
                <div className="flex items-center gap-1.5 px-4 py-2.5 bg-black/40 border-b border-white/6">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"/>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80"/>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"/>
                  <span className="ml-2 text-xs text-slate-600 font-mono">opx_execution_prompt.txt</span>
                </div>
                <pre className="code-block text-slate-300 p-5 overflow-auto max-h-[520px] whitespace-pre-wrap break-words">{prompt}</pre>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack}><ChevronLeft className="h-4 w-4"/>Back</Button>
            <Button variant="gold" size="lg" onClick={handleNext} className="min-w-48">Next: Ingest JSON<ChevronRight className="h-4 w-4"/></Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SRow: React.FC<{ icon: React.ReactNode; bg: string; label: string; value: string; sub?: string; valueClass?: string }> = ({ icon, bg, label, value, sub, valueClass }) => (
  <div className="flex items-start gap-2.5">
    <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center flex-shrink-0 border border-white/8`}>{icon}</div>
    <div className="min-w-0">
      <p className="text-xs text-slate-600 font-medium">{label}</p>
      <p className={`text-sm font-semibold text-slate-200 truncate ${valueClass ?? ''}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 italic mt-0.5 leading-snug">{sub}</p>}
    </div>
  </div>
);
