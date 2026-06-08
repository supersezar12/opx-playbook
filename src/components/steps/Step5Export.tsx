import React, { useState } from 'react';
import {
  ChevronLeft, Download, Package, Eye, Trophy, RefreshCw,
  ShieldCheck, Languages, FileText, CheckCircle2, Sparkles,
  LayoutTemplate, AlertCircle,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { buildHtmlExport } from '../../lib/htmlExporter';
import { storage } from '../../lib/localStorage';
import { formatDate, slugify } from '../../lib/utils';
import type { TrainingPayload, AppConfig, ExportOptions } from '../../types';

interface Step5Props {
  payload: TrainingPayload;
  config: AppConfig;
  options: ExportOptions;
  onOptionsChange: (opts: ExportOptions) => void;
  onBack: () => void;
  onStartNew: () => void;
}

export const Step5Export: React.FC<Step5Props> = ({
  payload, config, options, onOptionsChange, onBack, onStartNew
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const defaultTitle = `${config.jobTitle} - ${config.industry} Training Matrix`;

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError('');
    try {
      await new Promise(r => setTimeout(r, 400)); // UI feedback
      const html = buildHtmlExport(payload, config, {
        ...options,
        matrixTitle: options.matrixTitle || defaultTitle,
      });
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeJob = slugify(config.jobTitle);
      const safeSeniority = config.seniorityId;
      const date = formatDate();
      a.download = `OPX_${safeJob}_${safeSeniority}_${date}.html`;
      a.click();
      URL.revokeObjectURL(url);
      setShowSuccess(true);
    } catch (e: unknown) {
      setDownloadError(`Export failed: ${(e as Error).message}`);
    } finally {
      setDownloading(false);
    }
  };

  const handleStartNew = () => {
    storage.clearAll();
    onStartNew();
  };

  const preview1 = payload.stages.slice(0, 3);
  const preview2 = payload.exams[0];

  const filename = `OPX_${slugify(config.jobTitle)}_${config.seniorityId}_${formatDate()}.html`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 step-transition">
      {/* Page header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 rounded-2xl mb-4">
          <Package className="h-7 w-7 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Compiler & Export Engine</h1>
        <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
          Configure your export settings, review the sanity check, then compile and download your standalone HTML training matrix.
        </p>
      </div>

      <div className="space-y-6">
        {/* Build Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5 text-blue-500" />
              <CardTitle>Build Configuration</CardTitle>
            </div>
            <CardDescription>These settings control the behaviour of the exported HTML file.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Matrix title */}
            <Input
              label="Training Matrix Title"
              value={options.matrixTitle}
              onChange={e => onOptionsChange({ ...options, matrixTitle: e.target.value })}
              placeholder={defaultTitle}
              hint={`Default: "${defaultTitle}"`}
            />

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50"
                style={{ borderColor: options.antiCopy ? '#3b82f6' : '#e5e7eb' }}>
                <input
                  type="checkbox"
                  checked={options.antiCopy}
                  onChange={e => onOptionsChange({ ...options, antiCopy: e.target.checked })}
                  className="w-4 h-4 mt-0.5 accent-blue-600 rounded flex-shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-sm text-gray-900">Enable Anti-Copy Protection</span>
                    <Badge variant="info">Recommended</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Disables right-click, text selection, Ctrl+U, Ctrl+S, Ctrl+C, and F12 in the exported file. Adds DevTools detection. Does not prevent screenshots.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50"
                style={{ borderColor: options.bilingualToggle ? '#3b82f6' : '#e5e7eb' }}>
                <input
                  type="checkbox"
                  checked={options.bilingualToggle}
                  onChange={e => onOptionsChange({ ...options, bilingualToggle: e.target.checked })}
                  className="w-4 h-4 mt-0.5 accent-blue-600 rounded flex-shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Languages className="h-4 w-4 text-purple-600" />
                    <span className="font-semibold text-sm text-gray-900">Include Bilingual Toggle UI</span>
                    <Badge variant="success">Recommended</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Adds English / العربية / کوردی language switcher buttons to the exported file. Allows readers to toggle between languages for all stage and exam titles.
                  </p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Sanity Check Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-teal-500" />
              <CardTitle>Sanity Check Preview</CardTitle>
            </div>
            <CardDescription>First 3 stages and the first exam — verify the data looks correct before compiling.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {preview1.map(stage => (
                <div key={stage.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-lg">Stage {stage.id}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">{stage.title_en}</p>
                  <p className="text-xs text-gray-600 mb-1" dir="rtl">{stage.title_ar}</p>
                  <p className="text-xs text-gray-600 mb-2" dir="rtl">{stage.title_ku}</p>
                  <div className="flex gap-1 flex-wrap">
                    {stage.scenario_operational && <span className="text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded">⚙️</span>}
                    {stage.scenario_growth && <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">💼</span>}
                    {stage.scenario_dispute && <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">⚖️</span>}
                    {stage.scenario_emergency && <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded">🚨</span>}
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

        {/* Export summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-500" />
              <CardTitle>Export Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-5">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xl font-bold text-blue-600">{payload.stages.length}</p>
                <p className="text-xs text-gray-500 mt-0.5">Stages</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xl font-bold text-purple-600">{payload.exams.length}</p>
                <p className="text-xs text-gray-500 mt-0.5">Exams</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xl font-bold text-emerald-600">{options.antiCopy ? 'ON' : 'OFF'}</p>
                <p className="text-xs text-gray-500 mt-0.5">Anti-Copy</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xl font-bold text-teal-600">{options.bilingualToggle ? 'ON' : 'OFF'}</p>
                <p className="text-xs text-gray-500 mt-0.5">Bilingual UI</p>
              </div>
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
          </Alert>
        )}

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 pb-8">
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            size="lg"
            onClick={handleDownload}
            loading={downloading}
            className="sm:min-w-64 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            <Download className="h-5 w-5" />
            {downloading ? 'Compiling...' : 'Download .html File'}
          </Button>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        maxWidth="md"
      >
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full mb-5 shadow-lg">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">🎉 Export Complete!</h2>
          <p className="text-gray-500 mt-3 max-w-sm mx-auto">
            Your bilingual corporate training matrix has been compiled and downloaded successfully.
          </p>

          <div className="mt-5 px-4 py-3 bg-gray-50 rounded-xl text-left space-y-2 border border-gray-200">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-gray-700"><strong>{payload.stages.length}</strong> training stages compiled</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-gray-700"><strong>{payload.exams.length}</strong> milestone exams included</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-gray-700">Bilingual (Arabic + Kurdish) titles embedded</span>
            </div>
            {options.antiCopy && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-gray-700">Anti-copy protection activated</span>
              </div>
            )}
          </div>

          <div className="mt-5 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs text-blue-700">
              <strong>File saved as:</strong> <code className="font-mono">{filename}</code>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
            <Button
              variant="outline"
              onClick={() => setShowSuccess(false)}
            >
              Close
            </Button>
            <Button
              variant="secondary"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
              Download Again
            </Button>
            <Button
              onClick={handleStartNew}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Start New Project
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
