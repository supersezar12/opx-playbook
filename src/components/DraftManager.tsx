import React, { useState, useRef, useCallback } from 'react';
import {
  Save, FolderOpen, Trash2, Download, Upload,
  PencilLine, Clock, CheckCircle2, X, BookMarked, FilePlus,
} from 'lucide-react';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Alert } from './ui/Alert';
import { Badge } from './ui/Badge';
import { drafts } from '../lib/drafts';
import { analytics } from '../lib/analytics';
import type { DraftSnapshot, AppConfig, TrainingPayload, ExportOptions } from '../types';

interface DraftManagerProps {
  open: boolean;
  onClose: () => void;
  // Current wizard state to save
  currentStep: number;
  currentConfig: AppConfig;
  currentPayload: TrainingPayload | null;
  currentExportOptions: ExportOptions;
  // Callback when user loads a draft
  onLoad: (draft: DraftSnapshot) => void;
  // Toast function
  onToast: (variant: 'success' | 'error' | 'warning' | 'info', title: string, msg?: string) => void;
}

export const DraftManager: React.FC<DraftManagerProps> = ({
  open, onClose,
  currentStep, currentConfig, currentPayload, currentExportOptions,
  onLoad, onToast,
}) => {
  const [draftList, setDraftList] = useState<DraftSnapshot[]>([]);
  const [saveName, setSaveName] = useState('');
  const [saveNameError, setSaveNameError] = useState('');
  const [saving, setSaving] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refresh list whenever dialog opens
  const refreshList = useCallback(() => setDraftList(drafts.list()), []);

  React.useEffect(() => {
    if (open) {
      refreshList();
      setSaveName('');
      setSaveNameError('');
      setImportError('');
      setDeleteConfirmId(null);
      setRenamingId(null);
    }
  }, [open, refreshList]);

  // ─── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const name = saveName.trim();
    if (!name) {
      setSaveNameError('Draft name cannot be empty.');
      return;
    }
    if (name.length > 80) {
      setSaveNameError('Name must be 80 characters or fewer.');
      return;
    }
    setSaving(true);
    try {
      drafts.save(name, currentStep, currentConfig, currentPayload, currentExportOptions);
      analytics.track('draft_saved', { step: currentStep, name });
      onToast('success', 'Draft saved', `"${name}" saved successfully.`);
      setSaveName('');
      setSaveNameError('');
      refreshList();
    } catch (e: unknown) {
      onToast('error', 'Save failed', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Load ───────────────────────────────────────────────────────────────────
  const handleLoad = (draft: DraftSnapshot) => {
    onLoad(draft);
    analytics.track('draft_loaded', { draftId: draft.id, name: draft.name });
    onToast('success', 'Draft loaded', `Resumed "${draft.name}" at Step ${draft.step}.`);
    onClose();
  };

  // ─── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = (id: string) => {
    const draft = draftList.find(d => d.id === id);
    drafts.delete(id);
    analytics.track('draft_deleted', { draftId: id });
    onToast('info', 'Draft deleted', draft ? `"${draft.name}" was removed.` : undefined);
    setDeleteConfirmId(null);
    refreshList();
  };

  // ─── Export ──────────────────────────────────────────────────────────────────
  const handleExport = (id: string) => {
    try {
      drafts.exportToFile(id);
      analytics.track('draft_exported', { draftId: id });
      onToast('success', 'Draft exported', 'JSON file downloaded.');
    } catch (e: unknown) {
      onToast('error', 'Export failed', (e as Error).message);
    }
  };

  // ─── Import ──────────────────────────────────────────────────────────────────
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError('');
    try {
      const imported = await drafts.importFromFile(file);
      analytics.track('draft_imported', { name: imported.name });
      onToast('success', 'Draft imported', `"${imported.name}" added to your drafts.`);
      refreshList();
    } catch (err: unknown) {
      setImportError((err as Error).message);
    } finally {
      // reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ─── Rename ──────────────────────────────────────────────────────────────────
  const commitRename = (id: string) => {
    const val = renameValue.trim();
    if (!val) return;
    drafts.rename(id, val);
    setRenamingId(null);
    refreshList();
  };

  const stepLabel: Record<number, string> = {
    1: 'Configure', 2: 'Generate', 3: 'Ingest', 4: 'Audit', 5: 'Export',
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Draft Manager"
      description="Save your current progress, load a previous session, or import/export draft files."
      maxWidth="xl"
    >
      <div className="space-y-6">

        {/* ─── Save Current State ─────────────────────────── */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Save className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-sm text-blue-800">Save Current Session</span>
            <Badge variant="info">Step {currentStep} — {stepLabel[currentStep]}</Badge>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder='e.g., "Oil & Gas — Drilling Supervisor — Draft 1"'
                value={saveName}
                onChange={e => { setSaveName(e.target.value); setSaveNameError(''); }}
                error={saveNameError}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
            </div>
            <Button onClick={handleSave} loading={saving} className="flex-shrink-0 self-start h-[42px]">
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
          </div>
        </div>

        {/* ─── Import ─────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-gray-500" />
            Saved Drafts ({draftList.length})
          </span>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImport}
            />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-3.5 w-3.5" />
              Import .json
            </Button>
          </div>
        </div>

        {importError && (
          <Alert variant="danger" title="Import Failed">{importError}</Alert>
        )}

        {/* ─── Draft List ──────────────────────────────────── */}
        {draftList.length === 0 ? (
          <div className="py-10 text-center">
            <BookMarked className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">No drafts saved yet</p>
            <p className="text-xs text-gray-400 mt-1">Save your current session above to create your first draft.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {draftList.map(draft => (
              <div
                key={draft.id}
                className="group flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30 transition-all"
              >
                {/* Icon */}
                <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FilePlus className="h-4 w-4 text-indigo-600" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {renamingId === draft.id ? (
                    <div className="flex gap-2 items-center">
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') commitRename(draft.id);
                          if (e.key === 'Escape') setRenamingId(null);
                        }}
                        className="flex-1 text-sm px-2 py-1 rounded-lg border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button onClick={() => commitRename(draft.id)} className="text-emerald-600 hover:text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => setRenamingId(null)} className="text-gray-400 hover:text-gray-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-gray-900 truncate">{draft.name}</p>
                  )}
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <Badge variant="info" className="text-xs">Step {draft.step} — {stepLabel[draft.step] ?? '?'}</Badge>
                    {draft.payload && (
                      <Badge variant="success" className="text-xs">✓ Payload ({draft.payload.stages.length} stages)</Badge>
                    )}
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(draft.updatedAt).toLocaleDateString()} {new Date(draft.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {deleteConfirmId === draft.id ? (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-xs text-red-600 font-medium">Delete?</span>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(draft.id)}>Yes</Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(null)}>No</Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      title="Load draft"
                      onClick={() => handleLoad(draft)}
                      className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                    >
                      <FolderOpen className="h-4 w-4" />
                    </button>
                    <button
                      title="Rename"
                      onClick={() => { setRenamingId(draft.id); setRenameValue(draft.name); }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                      <PencilLine className="h-4 w-4" />
                    </button>
                    <button
                      title="Export as .json"
                      onClick={() => handleExport(draft.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      title="Delete draft"
                      onClick={() => setDeleteConfirmId(draft.id)}
                      className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
};
