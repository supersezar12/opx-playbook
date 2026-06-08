import React, { useState, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, Search, ShieldCheck, ShieldAlert,
  CheckCircle2, XCircle, Pencil, BookOpen, GraduationCap,
  ChevronLeft as CL, ChevronRight as CR, AlertTriangle,
} from 'lucide-react';
import { Button }    from '../ui/Button';
import { Badge }     from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Alert }     from '../ui/Alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { Dialog }    from '../ui/Dialog';
import { Input }     from '../ui/Input';
import { Textarea }  from '../ui/Textarea';
import { cn }        from '../../lib/utils';
import { runFullValidation, isStageComplete } from '../../lib/validator';
import { storage }   from '../../lib/localStorage';
import { analytics } from '../../lib/analytics';
import type { TrainingPayload, TrainingStage, TrainingExam } from '../../types';

interface Step4Props { payload: TrainingPayload; onPayloadUpdate: (p: TrainingPayload) => void; onBack: () => void; onNext: () => void; }

const PAGE = 10;

export const Step4Audit: React.FC<Step4Props> = ({ payload, onPayloadUpdate, onBack, onNext }) => {
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [vResult, setVResult] = useState<null | ReturnType<typeof runFullValidation>>(null);
  const [editStage, setEditStage] = useState<TrainingStage | null>(null);
  const [editExam,  setEditExam]  = useState<TrainingExam | null>(null);
  const [stageForm, setStageForm] = useState<TrainingStage | null>(null);
  const [examForm,  setExamForm]  = useState<TrainingExam | null>(null);

  const filtered = payload.stages.filter(s => !search || s.title_en.toLowerCase().includes(search.toLowerCase()) || s.focus_area.toLowerCase().includes(search.toLowerCase()) || String(s.id).includes(search));
  const totalPages = Math.ceil(filtered.length / PAGE);
  const paged = filtered.slice((page-1)*PAGE, page*PAGE);
  const complete = payload.stages.filter(s => isStageComplete(s as unknown as Record<string,unknown>)).length;
  const incomplete = payload.stages.length - complete;

  const handleValidate = () => {
    const r = runFullValidation(payload);
    setVResult(r);
    analytics.track('step_4_full_validation_run', { errors: r.errors.length, warnings: r.warnings.length });
  };

  const saveStage = useCallback(() => {
    if (!stageForm) return;
    const updated = { ...payload, stages: payload.stages.map(s => s.id === stageForm.id ? stageForm : s) };
    onPayloadUpdate(updated); storage.savePayload(updated);
    analytics.track('step_4_stage_edited', { stageId: stageForm.id });
    setEditStage(null); setStageForm(null);
  }, [stageForm, payload, onPayloadUpdate]);

  const saveExam = useCallback(() => {
    if (!examForm) return;
    const updated = { ...payload, exams: payload.exams.map(e => e.id === examForm.id ? examForm : e) };
    onPayloadUpdate(updated); storage.savePayload(updated);
    analytics.track('step_4_exam_edited', { examId: examForm.id });
    setEditExam(null); setExamForm(null);
  }, [examForm, payload, onPayloadUpdate]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 step-transition">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 relative">
          <div className="absolute inset-0 rounded-2xl bg-amber-500/20 blur-md"/>
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-600/10 border border-amber-500/30 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-amber-400"/>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Bilingual Review Suite</h1>
        <p className="text-slate-400 mt-2 text-sm">Review, search, and edit all 60 stages and 7 exams. Changes save immediately.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { v: payload.stages.length, l: 'Total Stages', c: 'text-blue-400' },
          { v: complete,              l: 'Complete',      c: 'text-emerald-400' },
          { v: incomplete,            l: 'Incomplete',    c: 'text-red-400', warn: incomplete > 0 },
          { v: payload.exams.length,  l: 'Exams',         c: 'text-purple-400' },
        ].map(({ v, l, c, warn }) => (
          <div key={l} className={cn('rounded-xl p-4 text-center border', warn ? 'border-red-500/30 bg-red-500/8' : 'border-white/8 bg-white/3')}>
            <p className={`text-2xl font-bold ${c}`}>{v}</p>
            <p className="text-xs text-slate-600 mt-0.5">{l}</p>
          </div>
        ))}
      </div>

      {incomplete > 0 && <Alert variant="warning" title={`${incomplete} stage${incomplete > 1 ? 's are' : ' is'} incomplete`} className="mb-5">Click any row to open the editor and fill in missing scenario fields.</Alert>}
      {vResult && (
        <div className="mb-5">
          {vResult.valid
            ? <Alert variant="success" title="Full Validation Passed">{vResult.warnings.map((w,i)=><p key={i} className="text-xs mt-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-amber-400"/>{w}</p>)}</Alert>
            : <Alert variant="danger" title={`Validation Failed — ${vResult.errors.length} issues`}><div className="mt-2 max-h-36 overflow-y-auto space-y-1">{vResult.errors.map((e,i)=><p key={i} className="text-xs flex items-start gap-1.5"><XCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5"/>{e}</p>)}</div></Alert>
          }
        </div>
      )}

      <Tabs defaultValue="stages">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <TabsList className="w-auto">
            <TabsTrigger value="stages"><BookOpen className="h-4 w-4"/>Stages (60)</TabsTrigger>
            <TabsTrigger value="exams"><GraduationCap className="h-4 w-4"/>Exams (7)</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" onClick={handleValidate}><ShieldAlert className="h-4 w-4"/>Run Validation</Button>
        </div>

        <TabsContent value="stages">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1"><CardTitle>Training Stages</CardTitle><CardDescription>Click any row to edit.</CardDescription></div>
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600"/>
                  <input type="text" placeholder="Search stages..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-800/60 border border-white/10 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"/>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/6 bg-white/2">
                      {['ID','Title EN','Title AR','Title KU','Focus','Status',''].map((h,i)=>(
                        <th key={i} className={`text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide ${i===2||i===3?'hidden lg:table-cell':i===4?'hidden md:table-cell':''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/4">
                    {paged.length === 0
                      ? <tr><td colSpan={7} className="py-12 text-center text-slate-600 text-sm">No stages match your search.</td></tr>
                      : paged.map(stage => {
                          const ok = isStageComplete(stage as unknown as Record<string,unknown>);
                          return (
                            <tr key={stage.id} onClick={()=>{setEditStage(stage);setStageForm({...stage});}} className="hover:bg-white/3 cursor-pointer transition-colors group">
                              <td className="px-4 py-3"><span className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-400 text-xs font-bold flex items-center justify-center">{stage.id}</span></td>
                              <td className="px-4 py-3 font-medium text-slate-200 max-w-[180px] truncate">{stage.title_en}</td>
                              <td className="px-4 py-3 text-slate-500 hidden lg:table-cell max-w-[140px] truncate" dir="rtl">{stage.title_ar}</td>
                              <td className="px-4 py-3 text-slate-500 hidden lg:table-cell max-w-[140px] truncate" dir="rtl">{stage.title_ku}</td>
                              <td className="px-4 py-3 hidden md:table-cell"><Badge variant="info" className="text-xs">{stage.focus_area}</Badge></td>
                              <td className="px-4 py-3">{ok?<Badge variant="success"><CheckCircle2 className="h-3 w-3"/>Complete</Badge>:<Badge variant="danger"><XCircle className="h-3 w-3"/>Incomplete</Badge>}</td>
                              <td className="px-4 py-3"><Pencil className="h-4 w-4 text-slate-700 group-hover:text-amber-400 transition-colors"/></td>
                            </tr>
                          );
                        })
                    }
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-white/6 flex items-center justify-between">
                  <span className="text-xs text-slate-600">{(page-1)*PAGE+1}–{Math.min(page*PAGE,filtered.length)} of {filtered.length}</span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" disabled={page===1} onClick={()=>setPage(p=>p-1)}><CL className="h-4 w-4"/></Button>
                    {Array.from({length:Math.min(totalPages,6)},(_,i)=>i+1).map(p=>(
                      <Button key={p} variant={p===page?'default':'ghost'} size="icon" onClick={()=>setPage(p)} className="text-xs">{p}</Button>
                    ))}
                    <Button variant="ghost" size="icon" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}><CR className="h-4 w-4"/></Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams">
          <Card>
            <CardHeader><CardTitle>Milestone Examinations</CardTitle><CardDescription>Click any row to edit.</CardDescription></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-white/6 bg-white/2">{['ID','Title EN','Title AR','Title KU','Qs','Pass',''].map((h,i)=><th key={i} className={`text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide ${i===2||i===3?'hidden lg:table-cell':''}`}>{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-white/4">
                  {payload.exams.map(exam=>(
                    <tr key={exam.id} onClick={()=>{setEditExam(exam);setExamForm({...exam});}} className="hover:bg-white/3 cursor-pointer transition-colors group">
                      <td className="px-4 py-3"><span className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-400 text-xs font-bold flex items-center justify-center">{exam.id}</span></td>
                      <td className="px-4 py-3 font-medium text-slate-200">{exam.title_en}</td>
                      <td className="px-4 py-3 text-slate-500 hidden lg:table-cell" dir="rtl">{exam.title_ar}</td>
                      <td className="px-4 py-3 text-slate-500 hidden lg:table-cell" dir="rtl">{exam.title_ku}</td>
                      <td className="px-4 py-3"><Badge variant="info">{exam.questions_count} Q</Badge></td>
                      <td className="px-4 py-3"><Badge variant="success">{exam.passing_score}%</Badge></td>
                      <td className="px-4 py-3"><Pencil className="h-4 w-4 text-slate-700 group-hover:text-amber-400 transition-colors"/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between mt-6 pb-10">
        <Button variant="outline" onClick={onBack}><ChevronLeft className="h-4 w-4"/>Back</Button>
        <Button variant="gold" size="lg" onClick={()=>{analytics.track('step_4_completed',{complete,incomplete});onNext();}} className="min-w-48">Next: Export<ChevronRight className="h-4 w-4"/></Button>
      </div>

      {/* Stage Edit Dialog */}
      <Dialog open={!!editStage} onClose={()=>{setEditStage(null);setStageForm(null);}} title={`Edit Stage ${editStage?.id}`} description={editStage?.title_en} maxWidth="2xl">
        {stageForm && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input label="Title (English)" value={stageForm.title_en} onChange={e=>setStageForm({...stageForm,title_en:e.target.value})}/>
              <BilInput label="Title (Arabic)" value={stageForm.title_ar} onChange={v=>setStageForm({...stageForm,title_ar:v})}/>
              <BilInput label="Title (Kurdish)" value={stageForm.title_ku} onChange={v=>setStageForm({...stageForm,title_ku:v})}/>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Focus Area" value={stageForm.focus_area} onChange={e=>setStageForm({...stageForm,focus_area:e.target.value})}/>
              <Input label="Risk Context" value={stageForm.risk_context} onChange={e=>setStageForm({...stageForm,risk_context:e.target.value})}/>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Textarea label="⚙️ Operational" rows={4} value={stageForm.scenario_operational} onChange={e=>setStageForm({...stageForm,scenario_operational:e.target.value})} error={!stageForm.scenario_operational.trim()?'Required':undefined}/>
                <Textarea label="💼 Growth" rows={4} value={stageForm.scenario_growth} onChange={e=>setStageForm({...stageForm,scenario_growth:e.target.value})} error={!stageForm.scenario_growth.trim()?'Required':undefined}/>
              </div>
              <div className="space-y-3">
                <Textarea label="⚖️ Dispute" rows={4} value={stageForm.scenario_dispute} onChange={e=>setStageForm({...stageForm,scenario_dispute:e.target.value})} error={!stageForm.scenario_dispute.trim()?'Required':undefined}/>
                <Textarea label="🚨 Emergency" rows={4} value={stageForm.scenario_emergency} onChange={e=>setStageForm({...stageForm,scenario_emergency:e.target.value})} error={!stageForm.scenario_emergency.trim()?'Required':undefined}/>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-white/8">
              <Button variant="outline" onClick={()=>{setEditStage(null);setStageForm(null);}}>Cancel</Button>
              <Button variant="gold" onClick={saveStage}>Save Changes</Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Exam Edit Dialog */}
      <Dialog open={!!editExam} onClose={()=>{setEditExam(null);setExamForm(null);}} title={`Edit Exam ${editExam?.id}`} description={editExam?.title_en} maxWidth="md">
        {examForm && (
          <div className="space-y-4">
            <Input label="Title (English)" value={examForm.title_en} onChange={e=>setExamForm({...examForm,title_en:e.target.value})}/>
            <BilInput label="Title (Arabic)" value={examForm.title_ar} onChange={v=>setExamForm({...examForm,title_ar:v})}/>
            <BilInput label="Title (Kurdish)" value={examForm.title_ku} onChange={v=>setExamForm({...examForm,title_ku:v})}/>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium text-slate-300 block mb-1.5">Questions</label><input type="number" min={1} value={examForm.questions_count} onChange={e=>setExamForm({...examForm,questions_count:parseInt(e.target.value)||0})} className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-gray-800/60 text-slate-100 focus:outline-none focus:border-amber-500/50"/></div>
              <div><label className="text-sm font-medium text-slate-300 block mb-1.5">Pass Score (%)</label><input type="number" min={0} max={100} value={examForm.passing_score} onChange={e=>setExamForm({...examForm,passing_score:parseInt(e.target.value)||0})} className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-gray-800/60 text-slate-100 focus:outline-none focus:border-amber-500/50"/></div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-white/8">
              <Button variant="outline" onClick={()=>{setEditExam(null);setExamForm(null);}}>Cancel</Button>
              <Button variant="gold" onClick={saveExam}>Save Changes</Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

const BilInput: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div><label className="text-sm font-medium text-slate-300 block mb-1.5">{label}</label>
  <input dir="rtl" value={value} onChange={e=>onChange(e.target.value)} className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-gray-800/60 text-slate-100 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"/></div>
);
