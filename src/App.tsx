import React, { useState, useEffect, useCallback } from 'react';
import { Header }           from './components/Header';
import { Step1Configure }   from './components/steps/Step1Configure';
import { Step2Generate }    from './components/steps/Step2Generate';
import { Step3Ingest }      from './components/steps/Step3Ingest';
import { Step4Audit }       from './components/steps/Step4Audit';
import { Step5Export }      from './components/steps/Step5Export';
import { DraftManager }     from './components/DraftManager';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ToastContainer, useToast } from './components/ui/Toast';
import { DiagnosticsPanel } from './components/DiagnosticsPanel';
import { storage }          from './lib/localStorage';
import { drafts }           from './lib/drafts';
import { analytics }        from './lib/analytics';
import { DEPARTMENTS_DATA } from './data/departments';
import type { AppConfig, TrainingPayload, ExportOptions, WizardStep, DraftSnapshot } from './types';

const DEFAULT_CONFIG: AppConfig = {
  industry: '', department: '', productCategories: [], jobTitle: '', seniorityId: '', policyText: '',
};
const DEFAULT_EXPORT: ExportOptions = {
  antiCopy: true, bilingualToggle: true, matrixTitle: '', templateId: 'executive',
};

export default function App() {
  const [currentStep,    setCurrentStep]    = useState<WizardStep>(1);
  const [config,         setConfig]         = useState<AppConfig>(DEFAULT_CONFIG);
  const [payload,        setPayload]        = useState<TrainingPayload | null>(null);
  const [exportOptions,  setExportOptions]  = useState<ExportOptions>(DEFAULT_EXPORT);
  const [hydrated,       setHydrated]       = useState(false);
  const [draftCount,     setDraftCount]     = useState(0);
  const [showDrafts,     setShowDrafts]     = useState(false);
  const [showAnalytics,  setShowAnalytics]  = useState(false);

  const { toasts, toast, dismiss } = useToast();

  // ─── Session hydration ────────────────────────────────────────────────────
  useEffect(() => {
    const savedConfig   = storage.loadConfig();
    const savedPayload  = storage.loadPayload();
    const savedStep     = storage.loadStep();
    const savedExport   = storage.loadExportOptions();

    if (savedConfig)  setConfig({ ...DEFAULT_CONFIG, ...savedConfig, productCategories: savedConfig.productCategories ?? [] });
    if (savedPayload) setPayload(savedPayload);
    if (savedExport)  setExportOptions(savedExport);
    if (savedStep >= 1 && savedStep <= 5) setCurrentStep(savedStep as WizardStep);

    setDraftCount(drafts.count());
    analytics.track('session_started');
    setHydrated(true);
  }, []);

  // ─── Persist on change ────────────────────────────────────────────────────
  useEffect(() => {
    if (!hydrated) return;
    storage.saveConfig(config);
    if (config.jobTitle && config.industry) {
      const deptName = DEPARTMENTS_DATA
        .find(d => d.industry === config.industry)?.departments
        .find(d => d.id === config.department)?.name ?? '';
      const catSuffix = config.productCategories.length > 0
        ? `(${config.productCategories.slice(0, 2).join(', ')}${config.productCategories.length > 2 ? '...' : ''})`
        : '';
      const titleParts = [config.jobTitle, deptName || config.industry, catSuffix, 'Training Matrix']
        .filter(Boolean).join(' - ');
      setExportOptions(prev => ({
        ...prev,
        matrixTitle: prev.matrixTitle || titleParts,
      }));
    }
  }, [config, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    storage.saveStep(currentStep);
  }, [currentStep, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    storage.saveExportOptions(exportOptions);
  }, [exportOptions, hydrated]);

  // ─── Navigation ───────────────────────────────────────────────────────────
  const goToStep = useCallback((step: WizardStep) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(step);
  }, []);

  const handleStartNew = () => {
    setConfig(DEFAULT_CONFIG);
    setPayload(null);
    setExportOptions(DEFAULT_EXPORT);
    goToStep(1);
  };

  // ─── Draft load handler ───────────────────────────────────────────────────
  const handleLoadDraft = (draft: DraftSnapshot) => {
    setConfig({ ...DEFAULT_CONFIG, ...draft.config, productCategories: draft.config.productCategories ?? [] });
    if (draft.payload) setPayload(draft.payload);
    setExportOptions(draft.exportOptions);
    goToStep(draft.step as WizardStep);
    storage.saveConfig(draft.config);
    if (draft.payload) storage.savePayload(draft.payload);
    storage.saveExportOptions(draft.exportOptions);
    storage.saveStep(draft.step);
  };

  // ─── Toast bridge (used by DraftManager + AnalyticsDashboard) ────────────
  const handleToast = (variant: 'success' | 'error' | 'warning' | 'info', title: string, msg?: string) => {
    toast[variant](title, msg);
  };

  // ─── Draft count refresh ──────────────────────────────────────────────────
  const refreshDraftCount = () => setDraftCount(drafts.count());

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Restoring your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>

      {/* ─── Persistent Header ─────────────────────────────── */}
      <Header
        currentStep={currentStep}
        draftCount={draftCount}
        onStepClick={step => goToStep(step)}
        onOpenDrafts={() => { setShowDrafts(true); refreshDraftCount(); }}
        onOpenAnalytics={() => setShowAnalytics(true)}
      />

      {/* ─── Wizard Steps ──────────────────────────────────── */}
      <main className="flex-1">
        {currentStep === 1 && (
          <Step1Configure
            config={config}
            onConfigChange={setConfig}
            onNext={() => goToStep(2)}
          />
        )}

        {currentStep === 2 && (
          <Step2Generate
            config={config}
            onBack={() => goToStep(1)}
            onNext={() => goToStep(3)}
          />
        )}

        {currentStep === 3 && (
          <Step3Ingest
            onBack={() => goToStep(2)}
            onNext={() => goToStep(4)}
            onPayloadLoaded={p => setPayload(p)}
            existingPayload={payload}
          />
        )}

        {currentStep === 4 && payload && (
          <Step4Audit
            payload={payload}
            onPayloadUpdate={setPayload}
            onBack={() => goToStep(3)}
            onNext={() => goToStep(5)}
          />
        )}

        {currentStep === 5 && payload && (
          <Step5Export
            payload={payload}
            config={config}
            options={exportOptions}
            onOptionsChange={setExportOptions}
            onBack={() => goToStep(4)}
            onStartNew={handleStartNew}
          />
        )}

        {/* Guard: steps 4/5 without payload */}
        {(currentStep === 4 || currentStep === 5) && !payload && (
          <div className="max-w-md mx-auto px-4 py-16 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No payload found</h2>
            <p className="text-gray-500 mb-6">
              Complete Step 3 (Ingest) before proceeding here.
            </p>
            <button
              onClick={() => goToStep(3)}
              className="bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 px-6 py-3 rounded-xl font-semibold hover:from-amber-400 hover:to-yellow-300 transition-colors"
            >
              Go to Ingest →
            </button>
          </div>
        )}
      </main>

      {/* ─── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-white/6 py-4 px-4 text-center" style={{ background: "rgba(10,13,20,0.95)" }}>
        <p className="text-xs text-slate-600">
          OPX Playbook Builder &nbsp;·&nbsp; Bilingual Corporate Training Matrix Factory
          &nbsp;·&nbsp; All data stored locally — no backend, no API keys
        </p>
      </footer>

      {/* ─── Draft Manager Modal ───────────────────────────── */}
      <DraftManager
        open={showDrafts}
        onClose={() => { setShowDrafts(false); refreshDraftCount(); }}
        currentStep={currentStep}
        currentConfig={config}
        currentPayload={payload}
        currentExportOptions={exportOptions}
        onLoad={handleLoadDraft}
        onToast={handleToast}
      />

      {/* ─── Analytics Dashboard Modal ─────────────────────── */}
      <AnalyticsDashboard
        open={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        onToast={handleToast}
      />

      {/* ─── Toast Container ───────────────────────────────── */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      <DiagnosticsPanel />
    </div>
  );
}
