import React, { useState } from 'react';
import {
  ChevronLeft, ChevronRight, Database, CheckCircle2,
  XCircle, AlertTriangle, ClipboardPaste,
} from 'lucide-react';
import { Button }   from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Alert }    from '../ui/Alert';
import { Badge }    from '../ui/Badge';
import { validatePayload } from '../../lib/validator';
import { storage }  from '../../lib/localStorage';
import { analytics } from '../../lib/analytics';
import type { TrainingPayload } from '../../types';

interface Step3Props {
  onBack: () => void;
  onNext: () => void;
  onPayloadLoaded: (payload: TrainingPayload) => void;
  existingPayload: TrainingPayload | null;
}

type ValidationState = 'idle' | 'success' | 'json_error' | 'schema_error';

export const Step3Ingest: React.FC<Step3Props> = ({
  onBack, onNext, onPayloadLoaded, existingPayload,
}) => {
  const [jsonText, setJsonText]         = useState('');
  const [state, setState]               = useState<ValidationState>(existingPayload ? 'success' : 'idle');
  const [jsonError, setJsonError]       = useState('');
  const [schemaErrors, setSchemaErrors] = useState<string[]>([]);
  const [validating, setValidating]     = useState(false);
  const [currentPayload, setCurrentPayload] = useState<TrainingPayload | null>(existingPayload);

  const handleValidate = async () => {
    if (!jsonText.trim()) {
      setState('json_error');
      setJsonError('No JSON provided. Please paste the AI-generated output into the text area.');
      analytics.track('step_3_validate_attempted', { result: 'empty' });
      return;
    }

    setValidating(true);
    analytics.track('step_3_validate_attempted');
    await new Promise(r => setTimeout(r, 300));

    const { result, error, schemaErrors: sErrors } = validatePayload(jsonText);

    if (error) {
      setState('json_error');
      setJsonError(error);
      setSchemaErrors([]);
      analytics.track('step_3_validate_failed_json');
    } else if (sErrors && sErrors.length > 0) {
      setState('schema_error');
      setSchemaErrors(sErrors);
      setJsonError('');
      analytics.track('step_3_validate_failed_schema', { errorCount: sErrors.length });
    } else if (result) {
      setState('success');
      setJsonError('');
      setSchemaErrors([]);
      setCurrentPayload(result);
      storage.savePayload(result);
      onPayloadLoaded(result);
      analytics.track('step_3_completed', {
        stages: result.stages.length,
        exams: result.exams.length,
      });
    }
    setValidating(false);
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 step-transition">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-100 rounded-2xl mb-4">
          <Database className="h-7 w-7 text-teal-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Payload Ingestor</h1>
        <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
          Paste the JSON output from your AI model. The validator will check the schema and surface any issues before you can proceed.
        </p>
      </div>

      {/* Existing payload banner */}
      {currentPayload && state === 'success' && (
        <div className="mb-6">
          <Alert variant="success" title="Payload Ready — you may proceed">
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="success">✓ {currentPayload.stages.length} Stages</Badge>
              <Badge variant="success">✓ {currentPayload.exams.length} Exams</Badge>
              <Badge variant="info">Saved to LocalStorage</Badge>
            </div>
            <p className="mt-2 text-xs text-emerald-600">
              Paste a new JSON below to replace this payload, or click Next to continue.
            </p>
          </Alert>
        </div>
      )}

      <div className="space-y-5">

        {/* JSON Textarea */}
        <Card className={state === 'json_error' || state === 'schema_error'
          ? 'border-red-300 ring-1 ring-red-300' : ''}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ClipboardPaste className="h-5 w-5 text-teal-500" />
              <CardTitle>Paste AI-Generated JSON <span className="text-red-500">*</span></CardTitle>
            </div>
            <CardDescription>
              Must contain a <code className="bg-gray-100 px-1 rounded text-xs">stages</code> array of exactly 60 objects
              and an <code className="bg-gray-100 px-1 rounded text-xs">exams</code> array of exactly 7 objects.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={jsonText}
              onChange={e => {
                setJsonText(e.target.value);
                if (state !== 'idle' && state !== 'success') setState('idle');
              }}
              placeholder={
                `Paste your AI-generated JSON here...\n\nExpected structure:\n{\n  "stages": [ ... 60 stage objects ... ],\n  "exams": [ ... 7 exam objects ... ]\n}`
              }
              className={`w-full min-h-[400px] px-4 py-3 text-xs font-mono rounded-xl border bg-gray-50 text-gray-900
                placeholder-gray-400 focus:outline-none focus:ring-2 resize-y transition-colors
                ${state === 'json_error' || state === 'schema_error'
                  ? 'border-red-400 focus:ring-red-400'
                  : state === 'success' && jsonText
                  ? 'border-emerald-400 focus:ring-emerald-400'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
              spellCheck={false}
              aria-invalid={state === 'json_error' || state === 'schema_error'}
            />
            <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
              <span className="text-xs text-gray-400">
                {jsonText.trim()
                  ? `${jsonText.trim().length.toLocaleString()} characters`
                  : currentPayload && state === 'success'
                  ? 'Existing payload loaded from session.'
                  : 'Awaiting input...'}
              </span>
              <Button
                onClick={handleValidate}
                loading={validating}
                variant={state === 'success' ? 'success' : 'default'}
              >
                {state === 'success'
                  ? <CheckCircle2 className="h-4 w-4" />
                  : <Database className="h-4 w-4" />}
                {validating ? 'Validating...' : state === 'success' ? 'Re-validate' : 'Validate & Parse'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* JSON error */}
        {state === 'json_error' && (
          <Alert variant="danger" title="JSON Parse Error">
            <code className="text-xs bg-red-100 px-2 py-1 rounded block mt-1 break-all">{jsonError}</code>
            <p className="mt-2 text-xs">
              Ensure the JSON starts with <code>{'{'}</code> and ends with <code>{'}'}</code>.
              Remove any markdown code fences (``` ```) if the AI wrapped the output.
            </p>
          </Alert>
        )}

        {/* Schema errors */}
        {state === 'schema_error' && schemaErrors.length > 0 && (
          <Alert variant="danger"
            title={`Schema Validation Failed — ${schemaErrors.length} issue${schemaErrors.length > 1 ? 's' : ''} found`}>
            <div className="mt-2 max-h-64 overflow-y-auto space-y-1">
              {schemaErrors.map((err, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <XCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                  <code className="break-all">{err}</code>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs">
              Ask the AI: <em>"Fix the following schema errors and return only the corrected JSON."</em>
            </p>
          </Alert>
        )}

        {/* Success */}
        {state === 'success' && jsonText.trim() && (
          <Alert variant="success" title="Payload validated successfully!">
            <div className="flex flex-wrap gap-2 mt-1">
              <Badge variant="success">✓ 60 Stages</Badge>
              <Badge variant="success">✓ 7 Exams</Badge>
              <Badge variant="success">✓ All required fields present</Badge>
              <Badge variant="info">Saved to LocalStorage</Badge>
            </div>
          </Alert>
        )}

        {/* Schema reference */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-sm">Required Schema Reference</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-semibold text-gray-700 mb-2">Stage Object (×60)</p>
                <div className="space-y-1 font-mono text-gray-600">
                  {['id','title_en','title_ar','title_ku','scenario_operational',
                    'scenario_growth','scenario_dispute','scenario_emergency',
                    'focus_area','risk_context'].map(k => (
                    <div key={k} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />{k}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-2">Exam Object (×7)</p>
                <div className="space-y-1 font-mono text-gray-600">
                  {['id','title_en','title_ar','title_ku','questions_count','passing_score'].map(k => (
                    <div key={k} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />{k}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between pb-8">
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex flex-col items-end gap-1">
            <Button
              size="lg"
              onClick={handleNext}
              disabled={state !== 'success' || !currentPayload}
              className="min-w-48"
            >
              Next: Audit Content
              <ChevronRight className="h-4 w-4" />
            </Button>
            {state !== 'success' && (
              <p className="text-xs text-red-500">Validate the JSON successfully to continue.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
