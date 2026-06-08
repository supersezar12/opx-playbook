import React, { useState } from 'react';
import {
  ChevronLeft, Download, Package, Eye, Trophy, RefreshCw,
  ShieldCheck, Languages, FileText, CheckCircle2, Sparkles,
  LayoutTemplate, AlertCircle, FileDown, LayoutGrid,
} from 'lucide-react';
import { Button }   from '../ui/Button';
import { Badge }    from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Alert }    from '../ui/Alert';
import { Dialog }   from '../ui/Dialog';
import { Input }    from '../ui/Input';
import { buildHtmlExport } from '../../lib/htmlExporter';
import { exportAsPdf }     from '../../lib/pdfExporter';
import { storage }   from '../../lib/localStorage';
import { analytics } from '../../lib/analytics';
import { formatDate, slugify } from '../../lib/utils';
import { DEPARTMENTS_DATA } from '../../data/departments';
import type { TrainingPayload, AppConfig, ExportOptions, Step5Errors } from '../../types';

interface Step5Props {
  payload: TrainingPayload;
  config: AppConfig;
  options: ExportOptions;
  onOptionsChange: (opts: ExportOptions) => void;
  onBack: () => void;
  onStartNew: () => void;
}

export const Step5Export: React.FC<Step5Props> = ({
  payload, config, options, onOptionsChange, onBack, onStartNew,
}) => {
  const [downloading,    setDownloading]    = useState(false);
  const [pdfExporting,   setPdfExporting]   = useState(false);
  const [downloadError,  setDownloadError]  = useState('');
  const [showSuccess,    setShowSuccess]    = useState(false);
  const [lastFormat,     setLastFormat]     = useState<'html' | 'pdf'>('html');
  const [touched,        setTouched]        = useState(false);
  const [errors,         setErrors]         = useState<Step5Errors>({});

  const defaultTitle = `${config.jobTitle} - ${config.industry} Training Matrix`;

  // Resolve department for display
  const deptData = DEPARTMENTS_DATA
    .find(d => d.industry === config.industry)?.departments
    .find(d => d.id === config.department) ?? null;

  function validate(): Step5Errors {
    const errs: Step5Errors = {};
    const title = (options.matrixTitle || defaultTitle).trim();
    if (!title) errs.matrixTitle = 'Matrix title cannot be empty.';
    if (title.length > 200) errs.matrixTitle = 'Title must be 200 characters or fewer.';
    return errs;
  }

  // ─── HTML Download ──────────────────────────────────────────────────────────
  const handleHtmlDownload = async () => {
    setTouched(true);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setDownloading(true);
    setDownloadError('');
    try {
      await new Promise(r => setTimeout(r, 350));
      const resolvedOptions = { ...options, matrixTitle: options.matrixTitle || defaultTitle };
      const html = buildHtmlExport(payload, config, resolvedOptions);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `OPX_${slugify(config.jobTitle)}_${config.seniorityId}_${formatDate()}.html`;
      a.click();
      URL.revokeObjectURL(url);
      analytics.track('step_5_html_downloaded', { industry: config.industry, seniority: config.seniorityId });
      analytics.track('step_5_completed');
      setLastFormat('html');
      setShowSuccess(true);
    } catch (e: unknown) {
      setDownloadError(`HTML export failed: ${(e as Error).message}`);
    } finally {
      setDownloading(false);
    }
  };

  // ─── PDF Export ─────────────────────────────────────────────────────────────
  const handlePdfExport = async () => {
    setTouched(true);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setPdfExporting(true);
    setDownloadError('');
    try {
      await new Promise(r => setTimeout(r, 200));
      const resolvedOptions = { ...options, matrixTitle: options.matrixTitle || defaultTitle };
      exportAsPdf(payload, config, resolvedOptions);
      analytics.track('step_5_pdf_downloaded', { industry: config.industry, seniority: config.seniorityId });
      analytics.track('step_5_completed');
      setLastFormat('pdf');
      setShowSuccess(true);
    } catch (e: unknown) {
      setDownloadError(`PDF export failed: ${(e as Error).message}`);
    } finally {
      setPdfExporting(false);
    }
  };

  const handleStartNew = () => {
    storage.clearAll();
    analytics.track('session_reset');
    onStartNew();
  };

  const preview1 = payload.stages.slice(0, 3);
  const preview2 = payload.exams[0];
  const filename = `OPX_${slugify(config.jobTitle)}_${config.seniorityId}_${formatDate()}.html`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 step-transition">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 rounded-2xl mb-4">
          <Package className="h-7 w-7 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Compiler &amp; Export Engine</h1>
        <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
          Configure your export, review the sanity check, then download your training matrix as HTML or PDF.
        </p>
      </div>

      <div className="space-y-6">

        {/* ─── Build Configuration ───────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5 text-blue-500" />
              <CardTitle>Build Configuration</CardTitle>
            </div>
            <CardDescription>These settings control the exported file's behaviour and metadata.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Input
              label="Training Matrix Title *"
              value={options.matrixTitle}
              onChange={e => {
                onOptionsChange({ ...options, matrixTitle: e.target.value });
                if (touched) setErrors(validate());
              }}
              onBlur={() => { setTouched(true); setErrors(validate()); }}
              placeholder={defaultTitle}
              hint={`Default: "${defaultTitle}"`}
              error={touched ? errors.matrixTitle : undefined}
            />

            <div className="space-y-3">
              <CheckboxOption
                checked={options.antiCopy}
                onChange={v => onOptionsChange({ ...options, antiCopy: v })}
                icon={<ShieldCheck className="h-4 w-4 text-blue-600" />}
                label="Enable Anti-Copy Protection"
                badge={<Badge variant="info">Recommended</Badge>}
                description="Disables right-click, text selection, Ctrl+U/S/C, F12, and DevTools detection in the exported file."
              />
              <CheckboxOption
                checked={options.bilingualToggle}
                onChange={v => onOptionsChange({ ...options, bilingualToggle: v })}
                icon={<Languages className="h-4 w-4 text-purple-600" />}
                label="Include Bilingual Toggle UI"
                badge={<Badge variant="success">Recommended</Badge>}
                description="Adds English / العربية / کوردی language switcher to the exported file."
              />
            </div>
          </CardContent>
        </Card>

        {/* ─── Sanity Check ──────────────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-teal-500" />
              <CardTitle>Sanity Check Preview</CardTitle>
            </div>
            <CardDescription>First 3 stages and the first exam — verify before compiling.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {preview1.map(stage => (
                <div key={stage.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <Badge variant="info" className="mb-2">Stage {stage.id}</Badge>
                  <p className="text-sm font-semibold text-gray-900 mb-1">{stage.title_en}</p>
                  <p className="text-xs text-gray-600 mb-1 truncate" dir="rtl">{stage.title_ar}</p>
                  <p className="text-xs text-gray-600 mb-2 truncate" dir="rtl">{stage.title_ku}</p>
                  <div className="flex gap-1 flex-wrap">
                    {stage.scenario_operational && <span className="text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded">⚙️</span>}
                    {stage.scenario_growth      && <span className="text-xs px-1.5 py-0.5 bg-blue-100   text-blue-700   rounded">💼</span>}
                    {stage.scenario_dispute     && <span className="text-xs px-1.5 py-0.5 bg-amber-100  text-amber-700  rounded">⚖️</span>}
                    {stage.scenario_emergency   && <span className="text-xs px-1.5 py-0.5 bg-red-100    text-red-700    rounded">🚨</span>}
                  </div>
                </div>
              ))}
            </div>

            {preview2 && (
              <div className="border-2 border-purple-200 rounded-xl p-4 bg-purple-50">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-bold text-purple-700">Exam {preview2.id}</span>
                </div>
                <p className="font-semibold text-gray-900">{preview2.title_en}</p>
                <p className="text-sm text-gray-600 mt-0.5" dir="rtl">{preview2.title_ar}</p>
                <div className="flex gap-3 mt-2 text-xs text-gray-500">
                  <span>📝 {preview2.questions_count} Questions</span>
                  <span>✅ {preview2.passing_score}% to Pass</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── Export Summary ────────────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-500" />
              <CardTitle>Export Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {/* Department pill */}
            {deptData && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-violet-50 border border-violet-200 rounded-xl">
                <LayoutGrid className="h-4 w-4 text-violet-600 flex-shrink-0" />
                <span className="text-sm font-medium text-violet-800">
                  {deptData.emoji} {deptData.name}
                </span>
                <span className="text-xs text-violet-500 ml-1">department scope applied</span>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-5">
              <SumCard value={payload.stages.length} label="Stages"       color="text-blue-600"    />
              <SumCard value={payload.exams.length}  label="Exams"        color="text-purple-600"  />
              <SumCard value={options.antiCopy ? 'ON' : 'OFF'} label="Anti-Copy" color="text-emerald-600" />
              <SumCard value={options.bilingualToggle ? 'ON' : 'OFF'} label="Bilingual UI" color="text-teal-600" />
            </div>
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 rounded-xl">
              <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <code className="text-emerald-400 text-xs font-mono break-all">{filename}</code>
            </div>
          </CardContent>
        </Card>

        {downloadError && (
          <Alert variant="danger" title="Export Failed">
            <AlertCircle className="h-4 w-4" />
            {downloadError}
            {downloadError.includes('Popup') && (
              <p className="mt-1 text-xs">Please allow popups for this site in your browser settings, then try again.</p>
            )}
          </Alert>
        )}

        {/* ─── Navigation + Export Buttons ───────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 pb-8">
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* PDF Export */}
            <Button
              variant="outline"
              size="lg"
              onClick={handlePdfExport}
              loading={pdfExporting}
              className="border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400"
            >
              <FileDown className="h-5 w-5" />
              {pdfExporting ? 'Generating PDF...' : 'Export as PDF'}
            </Button>
            {/* HTML Download */}
            <Button
              size="lg"
              onClick={handleHtmlDownload}
              loading={downloading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white sm:min-w-52"
            >
              <Download className="h-5 w-5" />
              {downloading ? 'Compiling...' : 'Download .html File'}
            </Button>
          </div>
        </div>

        {/* PDF hint */}
        <p className="text-xs text-center text-gray-400 -mt-4 pb-4">
          PDF opens a print-ready preview in a new tab — use your browser's "Save as PDF" option.
        </p>
      </div>

      {/* ─── Success Dialog ──────────────────────────────────── */}
      <Dialog open={showSuccess} onClose={() => setShowSuccess(false)} maxWidth="md">
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full mb-5 shadow-lg">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {lastFormat === 'pdf' ? '📄 PDF Ready!' : '🎉 Export Complete!'}
          </h2>
          <p className="text-gray-500 mt-3 max-w-sm mx-auto">
            {lastFormat === 'pdf'
              ? 'Your PDF preview has opened in a new tab. Use "Save as PDF" in the print dialog.'
              : 'Your bilingual corporate training matrix has been compiled and downloaded.'}
          </p>

          <div className="mt-5 px-4 py-3 bg-gray-50 rounded-xl text-left space-y-2 border border-gray-200">
            {[
              `${payload.stages.length} training stages compiled`,
              `${payload.exams.length} milestone exams included`,
              'Bilingual (Arabic + Kurdish) titles embedded',
              ...(options.antiCopy ? ['Anti-copy protection activated'] : []),
              ...(options.bilingualToggle ? ['Language toggle UI included'] : []),
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
            <Button variant="outline" onClick={() => setShowSuccess(false)}>Close</Button>
            <Button variant="secondary" onClick={lastFormat === 'pdf' ? handlePdfExport : handleHtmlDownload}>
              <Download className="h-4 w-4" />
              {lastFormat === 'pdf' ? 'Re-open PDF' : 'Download Again'}
            </Button>
            <Button onClick={handleStartNew}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
              <RefreshCw className="h-4 w-4" />
              Start New Project
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SumCard: React.FC<{ value: number | string; label: string; color: string }> = ({
  value, label, color,
}) => (
  <div className="bg-gray-50 rounded-xl p-3 text-center">
    <p className={`text-xl font-bold ${color}`}>{value}</p>
    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
  </div>
);

const CheckboxOption: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  icon: React.ReactNode;
  label: string;
  badge?: React.ReactNode;
  description: string;
}> = ({ checked, onChange, icon, label, badge, description }) => (
  <label
    className="flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50"
    style={{ borderColor: checked ? '#3b82f6' : '#e5e7eb' }}>
    <input
      type="checkbox"
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      className="w-4 h-4 mt-0.5 accent-blue-600 rounded flex-shrink-0"
    />
    <div>
      <div className="flex items-center gap-2 flex-wrap">
        {icon}
        <span className="font-semibold text-sm text-gray-900">{label}</span>
        {badge}
      </div>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  </label>
);
