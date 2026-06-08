import React from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';
import type { WizardStep } from '../types';

interface HeaderProps {
  currentStep: WizardStep;
  onStepClick?: (step: WizardStep) => void;
}

const STEPS: { id: WizardStep; label: string; short: string }[] = [
  { id: 1, label: 'Configure', short: '1' },
  { id: 2, label: 'Generate', short: '2' },
  { id: 3, label: 'Ingest', short: '3' },
  { id: 4, label: 'Audit', short: '4' },
  { id: 5, label: 'Export', short: '5' },
];

export const Header: React.FC<HeaderProps> = ({ currentStep, onStepClick }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-gray-900 text-base leading-none block">OPX Playbook</span>
            <span className="text-xs text-blue-600 font-medium">Builder</span>
          </div>
        </div>

        {/* Step Nav */}
        <nav className="flex items-center gap-1" aria-label="Wizard steps">
          {STEPS.map((step, idx) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            const isClickable = step.id < currentStep && onStepClick;

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => isClickable && onStepClick?.(step.id)}
                  disabled={!isClickable && !isActive}
                  className={[
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : isCompleted
                      ? 'text-emerald-700 hover:bg-emerald-50 cursor-pointer'
                      : 'text-gray-400 cursor-default',
                  ].join(' ')}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <span
                    className={[
                      'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                      isActive ? 'bg-white/20' : isCompleted ? 'bg-emerald-100' : 'bg-gray-100',
                    ].join(' ')}
                  >
                    {isCompleted ? '✓' : step.short}
                  </span>
                  <span className="hidden md:inline">{step.label}</span>
                </button>
                {idx < STEPS.length - 1 && (
                  <ChevronRight className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Status indicator */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-gray-500">Step {currentStep} of 5</span>
        </div>
      </div>
    </header>
  );
};
