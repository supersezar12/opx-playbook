import React from 'react';
import { BookOpen, ChevronRight, Save, BarChart3 } from 'lucide-react';
import type { WizardStep } from '../types';

interface HeaderProps {
  currentStep: WizardStep;
  draftCount: number;
  onStepClick?: (step: WizardStep) => void;
  onOpenDrafts: () => void;
  onOpenAnalytics: () => void;
}

const STEPS: { id: WizardStep; label: string; short: string }[] = [
  { id: 1, label: 'Configure', short: '1' },
  { id: 2, label: 'Generate',  short: '2' },
  { id: 3, label: 'Ingest',    short: '3' },
  { id: 4, label: 'Audit',     short: '4' },
  { id: 5, label: 'Export',    short: '5' },
];

export const Header: React.FC<HeaderProps> = ({
  currentStep, draftCount,
  onStepClick, onOpenDrafts, onOpenAnalytics,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 h-16 flex items-center justify-between gap-3">

        {/* ─── Logo ──────────────────────────────────────── */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-gray-900 text-base leading-none block">OPX Playbook</span>
            <span className="text-xs text-blue-600 font-medium">Builder</span>
          </div>
        </div>

        {/* ─── Step Nav ──────────────────────────────────── */}
        <nav className="flex items-center gap-0.5 sm:gap-1 flex-1 justify-center" aria-label="Wizard steps">
          {STEPS.map((step, idx) => {
            const isActive    = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            const isClickable = isCompleted && !!onStepClick;

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => isClickable && onStepClick?.(step.id)}
                  disabled={!isClickable && !isActive}
                  aria-current={isActive ? 'step' : undefined}
                  className={[
                    'flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 select-none',
                    isActive    ? 'bg-blue-600 text-white shadow-sm'
                    : isCompleted ? 'text-emerald-700 hover:bg-emerald-50 cursor-pointer'
                    : 'text-gray-400 cursor-default',
                  ].join(' ')}
                >
                  <span className={[
                    'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                    isActive    ? 'bg-white/20'
                    : isCompleted ? 'bg-emerald-100'
                    : 'bg-gray-100',
                  ].join(' ')}>
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

        {/* ─── Right Actions ──────────────────────────────── */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Drafts button */}
          <button
            onClick={onOpenDrafts}
            title="Draft Manager — save & load sessions"
            className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all border border-gray-200 hover:border-gray-300"
          >
            <Save className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Drafts</span>
            {draftCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                {draftCount > 9 ? '9+' : draftCount}
              </span>
            )}
          </button>

          {/* Analytics button */}
          <button
            onClick={onOpenAnalytics}
            title="Analytics Dashboard"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all border border-gray-200 hover:border-gray-300"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Analytics</span>
          </button>

          {/* Step indicator */}
          <div className="hidden sm:flex items-center gap-1.5 pl-1.5 border-l border-gray-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="text-xs text-gray-500 whitespace-nowrap">Step {currentStep}/5</span>
          </div>
        </div>

      </div>
    </header>
  );
};
