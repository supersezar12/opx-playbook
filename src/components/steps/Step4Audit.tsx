import React, { useState, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, Search, ShieldCheck, ShieldAlert,
  CheckCircle2, XCircle, Pencil, BookOpen, GraduationCap,
  ChevronLeftIcon, ChevronRightIcon, AlertTriangle,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { runFullValidation, isStageComplete } from '../../lib/validator';
import { storage } from '../../lib/localStorage';
import type { TrainingPayload, TrainingStage, TrainingExam } from '../../types';

interface Step4Props {
  payload: TrainingPayload;
  onPayloadUpdate: (payload: TrainingPayload) => void;
  onBack: () => void;
  onNext: () => void;
}

const PAGE_SIZE = 10;

export const Step4Audit: React.FC<Step4Props> = ({ payload, onPayloadUpdate, onBack, onNext }) => {
  const [search, setSearch] = useState('');
  const [stagePage, setStagePage] = useState(1);
  const [validationResult, setValidationResult] = useState<null | ReturnType<typeof runFullValidation>>(null);

  const [editingStage, setEditingStage] = useState<TrainingStage | null>(null);
  const [editingExam, setEditingExam] = useState<TrainingExam | null>(null);
  const [stageForm, setStageForm] = useState<TrainingStage | null>(null);
  const [examForm, setExamForm] = useState<TrainingExam | null>(null);

  // Filter + paginate stages
  const filtered = payload.stages.filter(s =>
    !search ||
    s.title_en.toLowerCase().includes(search.toLowerCase()) ||
    s.title_ar.includes(search) ||
    s.focus_area.toLowerCase().includes(search.toLowerCase()) ||
    String(s.id).includes(search)
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((stagePage - 1) * PAGE_SIZE, stagePage * PAGE_SIZE);

  const completeCount = payload.stages.filter(s => isStageComplete(s as unknown as Record<string, unknown>)).length;
  const incompleteCount = payload.stages.length - completeCount;

  const handleRunValidation = () => {
    setValidationResult(runFullValidation(payload));
  };

  const openStageEdit = (stage: TrainingStage) => {
    setEditingStage(stage);
    setStageForm({ ...stage });
  };

  const saveStage = useCallback(() => {
    if (!stageForm) return;
    const updated: TrainingPayload = {
      ...payload,
      stages: payload.stages.map(s => s.id === stageForm.id ? stageForm : s),
    };
    onPayloadUpdate(updated);
    storage.savePayload(updated);
    setEditingStage(null);
    setStageForm(null);
  }, [stageForm, payload, onPayloadUpdate]);

  const openExamEdit = (exam: TrainingExam) => {
    setEditingExam(exam);
    setExamForm({ ...exam });
  };

  const saveExam = useCallback(() => {
    if (!examForm) return;
    const updated: TrainingPayload = {
      ...payload,
      exams: payload.exams.map(e => e.id === examForm.id ? examForm : e),
    };
    onPayloadUpdate(updated);
    storage.savePayload(updated);
    setEditingExam(null);
    setExamForm(null);
  }, [examForm, payload, onPayloadUpdate]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 step-transition">
      {/* Page header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-2xl mb-4">
          <ShieldCheck className="h-7 w-7 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Bilingual Review & Editing Suite</h1>
        <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
          Review, search, and edit all 60 stages and 7 exams. Changes are saved to LocalStorage immediately.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{payload.stages.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Stages</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{completeCount}</p>
          <p className="text-xs text-gray-500 mt-1">Complete</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{incompleteCount}</p>
          <p className="text-xs text-gray-500 mt-1">Incomplete</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{payload.exams.length}</p>
          <p className="text-xs text-gray-500 mt-1">Exams</p>
        </div>
      </div>

      {/* Validation result */}
      {validationResult && (
        <div className="mb-6">
          {validationResult.valid ? (
            <Alert variant="success" title="Full Validation Passed — All stages are complete">
              {validationResult.warnings.length > 0 && (
                <div className="mt-2 space-y-1">
                  {validationResult.warnings.map((w, i) => (
                    <p key={i} className="text-xs text-amber-700 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 flex-shrink-0" /> {w}
                    </p>
                  ))}
                </div>
              )}
            </Alert>
          ) : (
            <Alert variant="danger" title={`Validation Failed — ${validationResult.errors.length} stage(s) with issues`}>
              <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                {validationResult.errors.map((err, i) => (
                  <p key={i} className="text-xs flex items-start gap-1.5">
                    <XCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                    {err}
                  </p>
                ))}
              </div>
            </Alert>
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="stages">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <TabsList className="w-auto">
            <TabsTrigger value="stages">
              <BookOpen className="h-4 w-4 mr-1.5" />
              Stages (60)
            </TabsTrigger>
            <TabsTrigger value="exams">
              <GraduationCap className="h-4 w-4 mr-1.5" />
              Exams (7)
            </TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" onClick={handleRunValidation}>
            <ShieldAlert className="h-4 w-4" />
            Run Full Validation
          </Button>
        </div>

        {/* Stages Tab */}
        <TabsContent value="stages">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <CardTitle>Training Stages</CardTitle>
                  <CardDescription>Click any row to open the inline editor.</CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search stages..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setStagePage(1); }}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-12">ID</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title EN</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Title AR</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Title KU</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Focus Area</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="px-4 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paged.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-400 text-sm">
                          No stages match your search.
                        </td>
                      </tr>
                    ) : (
                      paged.map(stage => {
                        const complete = isStageComplete(stage as unknown as Record<string, unknown>);
                        return (
                          <tr
                            key={stage.id}
                            className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                            onClick={() => openStageEdit(stage)}
                          >
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold">
                                {stage.id}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">
                              {stage.title_en}
                            </td>
                            <td className="px-4 py-3 text-gray-600 hidden lg:table-cell max-w-[150px] truncate" dir="rtl">
                              {stage.title_ar}
                            </td>
                            <td className="px-4 py-3 text-gray-600 hidden lg:table-cell max-w-[150px] truncate" dir="rtl">
                              {stage.title_ku}
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              <Badge variant="info" className="text-xs">{stage.focus_area}</Badge>
                            </td>
                            <td className="px-4 py-3">
                              {complete ? (
                                <Badge variant="success">
                                  <CheckCircle2 className="h-3 w-3" /> Complete
                                </Badge>
                              ) : (
                                <Badge variant="danger">
                                  <XCircle className="h-3 w-3" /> Incomplete
                                </Badge>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <Pencil className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Showing {(stagePage - 1) * PAGE_SIZE + 1}–{Math.min(stagePage * PAGE_SIZE, filtered.length)} of {filtered.length} stages
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={stagePage === 1}
                      onClick={() => setStagePage(p => p - 1)}
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: Math.min(totalPages, 6) }, (_, i) => i + 1).map(p => (
                      <Button
                        key={p}
                        variant={p === stagePage ? 'default' : 'ghost'}
                        size="icon"
                        onClick={() => setStagePage(p)}
                        className="text-xs"
                      >
                        {p}
                      </Button>
                    ))}
                    {totalPages > 6 && stagePage <= 6 && (
                      <span className="px-1 text-gray-400 text-xs">...</span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={stagePage === totalPages}
                      onClick={() => setStagePage(p => p + 1)}
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exams Tab */}
        <TabsContent value="exams">
          <Card>
            <CardHeader>
              <CardTitle>Milestone Examinations</CardTitle>
              <CardDescription>Click any row to edit exam details.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-12">ID</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title EN</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Title AR</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Title KU</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Questions</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pass Score</th>
                      <th className="px-4 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {payload.exams.map(exam => (
                      <tr
                        key={exam.id}
                        className="hover:bg-purple-50/50 cursor-pointer transition-colors group"
                        onClick={() => openExamEdit(exam)}
                      >
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold">
                            {exam.id}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{exam.title_en}</td>
                        <td className="px-4 py-3 text-gray-600 hidden lg:table-cell" dir="rtl">{exam.title_ar}</td>
                        <td className="px-4 py-3 text-gray-600 hidden lg:table-cell" dir="rtl">{exam.title_ku}</td>
                        <td className="px-4 py-3">
                          <Badge variant="info">{exam.questions_count} Q</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="success">{exam.passing_score}%</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Pencil className="h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      <div className="flex justify-between mt-6 pb-8">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <Button size="lg" onClick={onNext} className="min-w-48">
          Next: Export
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Stage Edit Dialog */}
      <Dialog
        open={!!editingStage}
        onClose={() => { setEditingStage(null); setStageForm(null); }}
        title={`Edit Stage ${editingStage?.id}`}
        description={editingStage?.title_en}
        maxWidth="2xl"
      >
        {stageForm && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Title (English)"
                value={stageForm.title_en}
                onChange={e => setStageForm({ ...stageForm, title_en: e.target.value })}
              />
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Title (Arabic)</label>
                <input
                  dir="rtl"
                  value={stageForm.title_ar}
                  onChange={e => setStageForm({ ...stageForm, title_ar: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Title (Kurdish)</label>
                <input
                  dir="rtl"
                  value={stageForm.title_ku}
                  onChange={e => setStageForm({ ...stageForm, title_ku: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Focus Area"
                value={stageForm.focus_area}
                onChange={e => setStageForm({ ...stageForm, focus_area: e.target.value })}
              />
              <Input
                label="Risk Context"
                value={stageForm.risk_context}
                onChange={e => setStageForm({ ...stageForm, risk_context: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Textarea
                  label="⚙️ Operational Scenario"
                  value={stageForm.scenario_operational}
                  onChange={e => setStageForm({ ...stageForm, scenario_operational: e.target.value })}
                  rows={4}
                  className="border-emerald-300 focus:ring-emerald-500"
                />
                <Textarea
                  label="💼 Growth Scenario"
                  value={stageForm.scenario_growth}
                  onChange={e => setStageForm({ ...stageForm, scenario_growth: e.target.value })}
                  rows={4}
                  className="border-blue-300 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-3">
                <Textarea
                  label="⚖️ Dispute Scenario"
                  value={stageForm.scenario_dispute}
                  onChange={e => setStageForm({ ...stageForm, scenario_dispute: e.target.value })}
                  rows={4}
                  className="border-amber-300 focus:ring-amber-500"
                />
                <Textarea
                  label="🚨 Emergency Scenario"
                  value={stageForm.scenario_emergency}
                  onChange={e => setStageForm({ ...stageForm, scenario_emergency: e.target.value })}
                  rows={4}
                  className="border-red-300 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={() => { setEditingStage(null); setStageForm(null); }}>Cancel</Button>
              <Button onClick={saveStage}>Save Changes</Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Exam Edit Dialog */}
      <Dialog
        open={!!editingExam}
        onClose={() => { setEditingExam(null); setExamForm(null); }}
        title={`Edit Exam ${editingExam?.id}`}
        description={editingExam?.title_en}
        maxWidth="md"
      >
        {examForm && (
          <div className="space-y-4">
            <Input
              label="Title (English)"
              value={examForm.title_en}
              onChange={e => setExamForm({ ...examForm, title_en: e.target.value })}
            />
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Title (Arabic)</label>
              <input
                dir="rtl"
                value={examForm.title_ar}
                onChange={e => setExamForm({ ...examForm, title_ar: e.target.value })}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Title (Kurdish)</label>
              <input
                dir="rtl"
                value={examForm.title_ku}
                onChange={e => setExamForm({ ...examForm, title_ku: e.target.value })}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Questions Count</label>
                <input
                  type="number"
                  min={1}
                  value={examForm.questions_count}
                  onChange={e => setExamForm({ ...examForm, questions_count: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Passing Score (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={examForm.passing_score}
                  onChange={e => setExamForm({ ...examForm, passing_score: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={() => { setEditingExam(null); setExamForm(null); }}>Cancel</Button>
              <Button onClick={saveExam}>Save Changes</Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
