import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Database, CheckCircle2, XCircle, AlertTriangle, ClipboardPaste } from 'lucide-react';
import { Button }    from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Alert }     from '../ui/Alert';
import { Badge }     from '../ui/Badge';
import { validatePayload } from '../../lib/validator';
import { storage }   from '../../lib/localStorage';
import { analytics } from '../../lib/analytics';
import { cn }        from '../../lib/utils';
import type { TrainingPayload } from '../../types';

interface Step3Props { onBack: () => void; onNext: () => void; onPayloadLoaded: (p: TrainingPayload) => void; existingPayload: TrainingPayload | null; }
type VState = 'idle' | 'success' | 'json_error' | 'schema_error';

export const Step3Ingest: React.FC<Step3Props> = ({ onBack, onNext, onPayloadLoaded, existingPayload }) => {
  const [jsonText, setJsonText]         = useState('');
  const [state, setState]               = useState<VState>(existingPayload ? 'success' : 'idle');
  const [jsonError, setJsonError]       = useState('');
  const [schemaErrors, setSchemaErrors] = useState<string[]>([]);
  const [validating, setValidating]     = useState(false);
  const [payload, setPayload]           = useState<TrainingPayload | null>(existingPayload);

  const handleValidate = async () => {
    if (!jsonText.trim()) {
      setState('json_error'); setJsonError('No JSON provided.');
      analytics.track('step_3_validate_attempted', { result: 'empty' });
      return;
    }
    setValidating(true);
    analytics.track('step_3_validate_attempted');
    await new Promise(r => setTimeout(r, 300));
    const { result, error, schemaErrors: sErrs } = validatePayload(jsonText);
    if (error) {
      setState('json_error'); setJsonError(error); setSchemaErrors([]);
      analytics.track('step_3_validate_failed_json');
    } else if (sErrs?.length) {
      setState('schema_error'); setSchemaErrors(sErrs); setJsonError('');
      analytics.track('step_3_validate_failed_schema', { errorCount: sErrs.length });
    } else if (result) {
      setState('success'); setJsonError(''); setSchemaErrors([]); setPayload(result);
      storage.savePayload(result); onPayloadLoaded(result);
      analytics.track('step_3_completed', { stages: result.stages.length, exams: result.exams.length });
    }
    setValidating(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 step-transition">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 relative">
          <div className="absolute inset-0 rounded-2xl bg-teal-500/20 blur-md"/>
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-600/10 border border-teal-500/30 flex items-center justify-center">
            <Database className="h-6 w-6 text-teal-400"/>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Payload Ingestor</h1>
        <p className="text-slate-400 mt-2 text-sm max-w-md mx-auto">Paste the AI-generated JSON. The validator checks schema before you can proceed.</p>
      </div>

      {payload && state === 'success' && (
        <Alert variant="success" title="Payload ready — you may proceed" className="mb-5">
          <div className="flex flex-wrap gap-2 mt-1.5">
            <Badge variant="success">✓ {payload.stages.length} Stages</Badge>
            <Badge variant="success">✓ {payload.exams.length} Exams</Badge>
            <Badge variant="info">Saved to LocalStorage</Badge>
          </div>
        </Alert>
      )}

      <div className="space-y-4">
        <Card className={cn(state === 'json_error' || state === 'schema_error' ? 'border-red-500/40' : state === 'success' && jsonText ? 'border-emerald-500/30' : '')}>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-teal-500/15 border border-teal-500/25 flex items-center justify-center flex-shrink-0">
                <ClipboardPaste className="h-3.5 w-3.5 text-teal-400"/>
              </div>
              <div>
                <CardTitle>Paste AI-Generated JSON <span className="text-amber-500 text-xs">*</span></CardTitle>
                <CardDescription>stages (×60) + exams (×7) — exact schema required.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <textarea
              value={jsonText}
              onChange={e => { setJsonText(e.target.value); if (state !== 'idle' && state !== 'success') setState('idle'); }}
              placeholder={`Paste your AI-generated JSON here...\n\n{\n  "stages": [ ... 60 objects ... ],\n  "exams": [ ... 7 objects ... ]\n}`}
              aria-invalid={state === 'json_error' || state === 'schema_error'}
              className={cn(
                'w-full min-h-[400px] px-4 py-3 text-xs font-mono rounded-xl border transition-all resize-y',
                'bg-gray-950/80 text-slate-300 placeholder-slate-600',
                'focus:outline-none focus:ring-2',
                state === 'json_error' || state === 'schema_error'
                  ? 'border-red-500/50 focus:ring-red-500/20'
                  : state === 'success' && jsonText
                  ? 'border-emerald-500/40 focus:ring-emerald-500/20'
                  : 'border-white/8 focus:border-amber-500/50 focus:ring-amber-500/15'
              )}
              spellCheck={false}
            />
            <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
              <span className="text-xs text-slate-600">
                {jsonText.trim() ? `${jsonText.trim().length.toLocaleString()} chars` : payload && state === 'success' ? 'Existing payload loaded.' : 'Awaiting input...'}
              </span>
              <Button onClick={handleValidate} loading={validating} variant={state === 'success' ? 'success' : 'default'}>
                {state === 'success' ? <CheckCircle2 className="h-4 w-4"/> : <Database className="h-4 w-4"/>}
                {validating ? 'Validating...' : state === 'success' ? 'Re-validate' : 'Validate & Parse'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {state === 'json_error' && (
          <Alert variant="danger" title="JSON Parse Error">
            <code className="text-xs bg-red-500/10 border border-red-500/20 px-2 py-1 rounded block mt-1 break-all text-red-300">{jsonError}</code>
            <p className="mt-2 text-xs text-slate-400">Remove any markdown fences (```) if the AI wrapped the output.</p>
          </Alert>
        )}
        {state === 'schema_error' && schemaErrors.length > 0 && (
          <Alert variant="danger" title={`Schema Failed — ${schemaErrors.length} issue${schemaErrors.length > 1 ? 's' : ''}`}>
            <div className="mt-2 max-h-56 overflow-y-auto space-y-1">
              {schemaErrors.map((err, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
                  <XCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5"/><code className="break-all">{err}</code>
                </div>
              ))}
            </div>
          </Alert>
        )}
        {state === 'success' && jsonText.trim() && (
          <Alert variant="success" title="Payload validated!">
            <div className="flex flex-wrap gap-1.5 mt-1"><Badge variant="success">✓ 60 Stages</Badge><Badge variant="success">✓ 7 Exams</Badge><Badge variant="success">All fields present</Badge><Badge variant="info">Saved</Badge></div>
          </Alert>
        )}

        {/* Schema ref */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400"/><CardTitle className="text-sm">Required Schema Reference</CardTitle></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <p className="font-semibold text-slate-400 mb-2 font-sans">Stage Object (×60)</p>
                {['id','title_en','title_ar','title_ku','scenario_operational','scenario_growth','scenario_dispute','scenario_emergency','focus_area','risk_context'].map(k=>(
                  <div key={k} className="flex items-center gap-1.5 mb-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"/><span className="text-slate-500">{k}</span></div>
                ))}
              </div>
              <div>
                <p className="font-semibold text-slate-400 mb-2 font-sans">Exam Object (×7)</p>
                {['id','title_en','title_ar','title_ku','questions_count','passing_score'].map(k=>(
                  <div key={k} className="flex items-center gap-1.5 mb-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0"/><span className="text-slate-500">{k}</span></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between pb-10">
          <Button variant="outline" onClick={onBack}><ChevronLeft className="h-4 w-4"/>Back</Button>
          <div className="flex flex-col items-end gap-1">
            <Button variant="gold" size="lg" onClick={onNext} disabled={state !== 'success' || !payload} className="min-w-48">
              Next: Audit Content<ChevronRight className="h-4 w-4"/>
            </Button>
            {state !== 'success' && <p className="text-xs text-red-400">Validate the JSON first.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
