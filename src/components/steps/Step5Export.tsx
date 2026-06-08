import React, { useState } from 'react';
import {
  ChevronLeft, Download, Package, Eye, Trophy, RefreshCw,
  ShieldCheck, Languages, FileText, CheckCircle2, Sparkles,
  LayoutTemplate, AlertCircle, FileDown, LayoutGrid,
} from 'lucide-react';
import { Button }    from '../ui/Button';
import { Badge }     from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Alert }     from '../ui/Alert';
import { Dialog }    from '../ui/Dialog';
import { Input }     from '../ui/Input';
import { buildHtmlExport } from '../../lib/htmlExporter';
import { exportAsPdf }     from '../../lib/pdfExporter';
import { storage }         from '../../lib/localStorage';
import { analytics }       from '../../lib/analytics';
import { formatDate, slugify } from '../../lib/utils';
import { DEPARTMENTS_DATA }    from '../../data/departments';
import { cn }                  from '../../lib/utils';
import type { TrainingPayload, AppConfig, ExportOptions, Step5Errors } from '../../types';

interface Step5Props { payload: TrainingPayload; config: AppConfig; options: ExportOptions; onOptionsChange: (o: ExportOptions) => void; onBack: () => void; onStartNew: () => void; }

export const Step5Export: React.FC<Step5Props> = ({ payload, config, options, onOptionsChange, onBack, onStartNew }) => {
  const [downloading, setDownloading] = useState(false);
  const [pdfBusy,     setPdfBusy]     = useState(false);
  const [dlError,     setDlError]     = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastFmt,     setLastFmt]     = useState<'html'|'pdf'>('html');
  const [touched,     setTouched]     = useState(false);
  const [errors,      setErrors]      = useState<Step5Errors>({});

  const defaultTitle = `${config.jobTitle} - ${config.industry} Training Matrix`;
  const deptData = DEPARTMENTS_DATA.find(d => d.industry === config.industry)?.departments.find(d => d.id === config.department) ?? null;

  function validate(): Step5Errors {
    const e: Step5Errors = {};
    const t = (options.matrixTitle || defaultTitle).trim();
    if (!t) e.matrixTitle = 'Title cannot be empty.';
    if (t.length > 200) e.matrixTitle = 'Title must be 200 chars or fewer.';
    return e;
  }

  const resolvedOptions = { ...options, matrixTitle: options.matrixTitle || defaultTitle };

  const handleHtml = async () => {
    setTouched(true);
    const errs = validate(); setErrors(errs);
    if (Object.keys(errs).length) return;
    setDownloading(true); setDlError('');
    try {
      await new Promise(r => setTimeout(r, 350));
      const html = buildHtmlExport(payload, config, resolvedOptions);
      const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' })),
        download: `OPX_${slugify(config.jobTitle)}_${config.seniorityId}_${formatDate()}.html`,
      });
      a.click(); URL.revokeObjectURL(a.href);
      analytics.track('step_5_html_downloaded', { industry: config.industry }); analytics.track('step_5_completed');
      setLastFmt('html'); setShowSuccess(true);
    } catch (e: unknown) { setDlError(`HTML export failed: ${(e as Error).message}`); }
    finally { setDownloading(false); }
  };

  const handlePdf = async () => {
    setTouched(true);
    const errs = validate(); setErrors(errs);
    if (Object.keys(errs).length) return;
    setPdfBusy(true); setDlError('');
    try {
      await new Promise(r => setTimeout(r, 200));
      exportAsPdf(payload, config, resolvedOptions);
      analytics.track('step_5_pdf_downloaded', { industry: config.industry }); analytics.track('step_5_completed');
      setLastFmt('pdf'); setShowSuccess(true);
    } catch (e: unknown) { setDlError(`PDF export failed: ${(e as Error).message}`); }
    finally { setPdfBusy(false); }
  };

  const filename = `OPX_${slugify(config.jobTitle)}_${config.seniorityId}_${formatDate()}.html`;
  const preview1 = payload.stages.slice(0, 3);
  const preview2 = payload.exams[0];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 step-transition">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 relative">
          <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 blur-md"/>
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-600/10 border border-emerald-500/30 flex items-center justify-center">
            <Package className="h-6 w-6 text-emerald-400"/>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Compiler &amp; Export Engine</h1>
        <p className="text-slate-400 mt-2 text-sm">Configure, review, then download your training matrix as HTML or PDF.</p>
      </div>

      <div className="space-y-5">
        {/* Build Config */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center flex-shrink-0"><LayoutTemplate className="h-3.5 w-3.5 text-blue-400"/></div>
              <div><CardTitle>Build Configuration</CardTitle><CardDescription>Controls the exported file's metadata and behaviour.</CardDescription></div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <Input label="Training Matrix Title *" value={options.matrixTitle} onChange={e=>{onOptionsChange({...options,matrixTitle:e.target.value});if(touched)setErrors(validate());}} onBlur={()=>{setTouched(true);setErrors(validate());}} placeholder={defaultTitle} hint={`Default: "${defaultTitle}"`} error={touched?errors.matrixTitle:undefined}/>
            <div className="space-y-3">
              <CBox checked={options.antiCopy} onChange={v=>onOptionsChange({...options,antiCopy:v})} icon={<ShieldCheck className="h-4 w-4 text-blue-400"/>} label="Enable Anti-Copy Protection" badge={<Badge variant="info">Recommended</Badge>} desc="Disables right-click, F12, Ctrl+U/S/C and DevTools detection in the exported file."/>
              <CBox checked={options.bilingualToggle} onChange={v=>onOptionsChange({...options,bilingualToggle:v})} icon={<Languages className="h-4 w-4 text-purple-400"/>} label="Include Bilingual Toggle UI" badge={<Badge variant="success">Recommended</Badge>} desc="Adds English / العربية / کوردی switcher to the exported file."/>
            </div>
          </CardContent>
        </Card>

        {/* Sanity Check */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-teal-500/15 border border-teal-500/25 flex items-center justify-center flex-shrink-0"><Eye className="h-3.5 w-3.5 text-teal-400"/></div>
              <div><CardTitle>Sanity Check Preview</CardTitle><CardDescription>First 3 stages and exam 1 — verify before compiling.</CardDescription></div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {preview1.map(stage => (
                <div key={stage.id} className="border border-white/8 rounded-xl p-4 bg-white/2">
                  <Badge variant="info" className="mb-2">Stage {stage.id}</Badge>
                  <p className="text-sm font-semibold text-slate-200 mb-1">{stage.title_en}</p>
                  <p className="text-xs text-slate-600 mb-1 truncate" dir="rtl">{stage.title_ar}</p>
                  <p className="text-xs text-slate-600 mb-2 truncate" dir="rtl">{stage.title_ku}</p>
                  <div className="flex gap-1 flex-wrap">
                    {stage.scenario_operational && <span className="text-xs px-1.5 py-0.5 bg-emerald-500/15 text-emerald-400 rounded border border-emerald-500/20">⚙️</span>}
                    {stage.scenario_growth      && <span className="text-xs px-1.5 py-0.5 bg-blue-500/15    text-blue-400    rounded border border-blue-500/20   ">💼</span>}
                    {stage.scenario_dispute     && <span className="text-xs px-1.5 py-0.5 bg-amber-500/15   text-amber-400   rounded border border-amber-500/20  ">⚖️</span>}
                    {stage.scenario_emergency   && <span className="text-xs px-1.5 py-0.5 bg-red-500/15     text-red-400     rounded border border-red-500/20    ">🚨</span>}
                  </div>
                </div>
              ))}
            </div>
            {preview2 && (
              <div className="border border-purple-500/30 rounded-xl p-4 bg-purple-500/8">
                <div className="flex items-center gap-2 mb-2"><Trophy className="h-4 w-4 text-purple-400"/><span className="text-xs font-bold text-purple-400">Exam {preview2.id}</span></div>
                <p className="font-semibold text-slate-200">{preview2.title_en}</p>
                <p className="text-sm text-slate-500 mt-0.5" dir="rtl">{preview2.title_ar}</p>
                <div className="flex gap-3 mt-2 text-xs text-slate-500"><span>📝 {preview2.questions_count} Questions</span><span>✅ {preview2.passing_score}% Pass</span></div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Export Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-700/60 border border-white/10 flex items-center justify-center flex-shrink-0"><FileText className="h-3.5 w-3.5 text-slate-400"/></div>
              <div><CardTitle>Export Summary</CardTitle></div>
            </div>
          </CardHeader>
          <CardContent>
            {deptData && (
              <div className="flex items-center gap-2 mb-4 p-3 rounded-xl border border-violet-500/25 bg-violet-500/8">
                <LayoutGrid className="h-4 w-4 text-violet-400 flex-shrink-0"/>
                <span className="text-sm font-medium text-violet-300">{deptData.emoji} {deptData.name}</span>
                <span className="text-xs text-violet-600 ml-1">department scope applied</span>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-5">
              {[
                {v:payload.stages.length, l:'Stages', c:'text-blue-400'},
                {v:payload.exams.length, l:'Exams', c:'text-purple-400'},
                {v:options.antiCopy?'ON':'OFF', l:'Anti-Copy', c:'text-emerald-400'},
                {v:options.bilingualToggle?'ON':'OFF', l:'Bilingual UI', c:'text-teal-400'},
              ].map(({v,l,c})=>(
                <div key={l} className="rounded-xl bg-white/3 border border-white/6 p-3">
                  <p className={`text-xl font-bold ${c}`}>{v}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 px-4 py-3 bg-black/40 border border-white/6 rounded-xl">
              <FileText className="h-4 w-4 text-slate-600 flex-shrink-0"/>
              <code className="text-emerald-400 text-xs font-mono break-all">{filename}</code>
            </div>
          </CardContent>
        </Card>

        {dlError && <Alert variant="danger" title="Export Failed"><AlertCircle className="h-4 w-4"/>{dlError}{dlError.includes('Popup')&&<p className="mt-1 text-xs">Allow popups for this site and try again.</p>}</Alert>}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 pb-10">
          <Button variant="outline" onClick={onBack}><ChevronLeft className="h-4 w-4"/>Back</Button>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" size="lg" onClick={handlePdf} loading={pdfBusy} className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
              <FileDown className="h-5 w-5"/>{pdfBusy?'Generating...':'Export as PDF'}
            </Button>
            <Button variant="gold" size="lg" onClick={handleHtml} loading={downloading} className="sm:min-w-52">
              <Download className="h-5 w-5"/>{downloading?'Compiling...':'Download .html File'}
            </Button>
          </div>
        </div>
        <p className="text-xs text-center text-slate-600 -mt-6 pb-4">PDF opens a print-ready tab — use browser's "Save as PDF".</p>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onClose={()=>setShowSuccess(false)} maxWidth="md">
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5 relative">
            <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-lg"/>
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center shadow-gold-md">
              <Sparkles className="h-9 w-9 text-gray-900"/>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-100">{lastFmt==='pdf'?'📄 PDF Ready!':'🎉 Export Complete!'}</h2>
          <p className="text-slate-400 mt-3 max-w-xs mx-auto text-sm">{lastFmt==='pdf'?'PDF preview opened in a new tab. Use "Save as PDF" in print dialog.':'Your bilingual training matrix has been compiled and downloaded.'}</p>
          <div className="mt-5 px-4 py-4 bg-white/3 border border-white/8 rounded-xl text-left space-y-2">
            {[`${payload.stages.length} training stages compiled`,`${payload.exams.length} milestone exams included`,'Bilingual (Arabic + Kurdish) titles embedded',...(options.antiCopy?['Anti-copy protection activated']:[])].map((item,i)=>(
              <div key={i} className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0"/><span className="text-slate-300">{item}</span></div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
            <Button variant="outline" onClick={()=>setShowSuccess(false)}>Close</Button>
            <Button variant="secondary" onClick={lastFmt==='pdf'?handlePdf:handleHtml}><Download className="h-4 w-4"/>{lastFmt==='pdf'?'Re-open PDF':'Download Again'}</Button>
            <Button variant="gold" onClick={()=>{storage.clearAll();analytics.track('session_reset');onStartNew();}}><RefreshCw className="h-4 w-4"/>Start New Project</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

const CBox: React.FC<{checked:boolean;onChange:(v:boolean)=>void;icon:React.ReactNode;label:string;badge?:React.ReactNode;desc:string}> = ({checked,onChange,icon,label,badge,desc})=>(
  <label className={cn('flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',checked?'border-amber-500/30 bg-amber-500/6':'border-white/8 bg-white/2 hover:border-white/16')}>
    <input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} className="w-4 h-4 mt-0.5 accent-amber-500 rounded flex-shrink-0"/>
    <div>
      <div className="flex items-center gap-2 flex-wrap">{icon}<span className="font-semibold text-sm text-slate-200">{label}</span>{badge}</div>
      <p className="text-xs text-slate-500 mt-1">{desc}</p>
    </div>
  </label>
);
