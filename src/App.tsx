import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Step1Configure } from './components/steps/Step1Configure';
import { Step2Generate } from './components/steps/Step2Generate';
import { Step3Ingest } from './components/steps/Step3Ingest';
import { Step4Audit } from './components/steps/Step4Audit';
import { Step5Export } from './components/steps/Step5Export';
import { storage } from './lib/localStorage';
import type { AppConfig, TrainingPayload, ExportOptions, WizardStep } from './types';

const DEFAULT_CONFIG: AppConfig = {
  industry: '',
  jobTitle: '',
  seniorityId: '',
  policyText: '',
};

const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  antiCopy: true,
  bilingualToggle: true,
  matrixTitle: '',
};

export default function App() {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [payload, setPayload] = useState<TrainingPayload | null>(null);
  const [exportOptions, setExportOptions] = useState<ExportOptions>(DEFAULT_EXPORT_OPTIONS);
  const [hydrated, setHydrated] = useState(false);

  // Restore session from LocalStorage
  useEffect(() => {
    const savedConfig = storage.loadConfig();
    const savedPayload = storage.loadPayload();
    const savedStep = storage.loadStep();
    const savedExportOpts = storage.loadExportOptions();

    if (savedConfig) setConfig(savedConfig);
    if (savedPayload) setPayload(savedPayload);
    if (savedExportOpts) setExportOptions(savedExportOpts);
    if (savedStep && savedStep >= 1 && savedStep <= 5) {
      setCurrentStep(savedStep as WizardStep);
    }
    setHydrated(true);
  }, []);

  // Persist config changes
  useEffect(() => {
    if (!hydrated) return;
    storage.saveConfig(config);
    // Auto-fill matrix title when config changes
    if (config.jobTitle && config.industry) {
      setExportOptions(prev => ({
        ...prev,
        matrixTitle: prev.matrixTitle || `${config.jobTitle} - ${config.industry} Training Matrix`,
      }));
    }
  }, [config, hydrated]);

  // Persist step changes
  useEffect(() => {
    if (!hydrated) return;
    storage.saveStep(currentStep);
  }, [currentStep, hydrated]);

  // Persist export options
  useEffect(() => {
    if (!hydrated) return;
    storage.saveExportOptions(exportOptions);
  }, [exportOptions, hydrated]);

  const goToStep = (step: WizardStep) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(step);
  };

  const handleStartNew = () => {
    setConfig(DEFAULT_CONFIG);
    setPayload(null);
    setExportOptions(DEFAULT_EXPORT_OPTIONS);
    goToStep(1);
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Restoring your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        currentStep={currentStep}
        onStepClick={step => goToStep(step)}
      />

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
            onPayloadLoaded={(p) => setPayload(p)}
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

        {/* Guard: if step 4 or 5 without payload, redirect */}
        {(currentStep === 4 || currentStep === 5) && !payload && (
          <div className="max-w-md mx-auto px-4 py-16 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No payload found</h2>
            <p className="text-gray-500 mb-6">You need to complete Step 3 (Ingest) before proceeding here.</p>
            <button
              onClick={() => goToStep(3)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Go to Ingest →
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-4 px-4 text-center">
        <p className="text-xs text-gray-400">
          OPX Playbook Builder &nbsp;·&nbsp; Bilingual Corporate Training Matrix Factory &nbsp;·&nbsp;
          All data stored locally — no backend, no API keys
        </p>
      </footer>
    </div>
  );
}
