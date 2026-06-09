import React from 'react';
import { BookOpen, ChevronRight, Save, BarChart3, Zap } from 'lucide-react';
import { DeployStatusBadge } from './DeployMonitor';
import type { WizardStep }   from '../types';
import type { BuildState }   from '../lib/deployMonitor';

interface HeaderProps {
  currentStep:       WizardStep;
  draftCount:        number;
  deployState:       BuildState;
  deployIsAhead:     boolean;
  deployAheadCount:  number;
  onStepClick?:      (step: WizardStep) => void;
  onOpenDrafts:      () => void;
  onOpenAnalytics:   () => void;
  onOpenDeploy:      () => void;
}

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 1, label: 'Configure' },
  { id: 2, label: 'Generate'  },
  { id: 3, label: 'Ingest'    },
  { id: 4, label: 'Audit'     },
  { id: 5, label: 'Export'    },
];

export const Header: React.FC<HeaderProps> = ({
  currentStep, draftCount, deployState, deployIsAhead, deployAheadCount,
  onStepClick, onOpenDrafts, onOpenAnalytics, onOpenDeploy,
}) => {
  return (
    <header
      className="sticky top-0 z-40 border-b border-white/6"
      style={{ background: 'rgba(10,13,20,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
    >
      {/* Gold accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">

        {/* ── Logo ── */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="relative w-8 h-8 flex-shrink-0">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 opacity-20 blur-sm" />
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-gold-sm">
              <BookOpen className="h-4 w-4 text-gray-900" />
            </div>
          </div>
          <div className="hidden sm:block leading-none">
            <span className="font-bold text-sm text-slate-100 block tracking-tight">OPX Playbook</span>
            <span className="text-xs font-medium" style={{ color: '#f0b429' }}>Builder</span>
          </div>
        </div>

        {/* ── Step Wizard Nav ── */}
        <nav className="flex items-center gap-0.5 flex-1 justify-center" aria-label="Wizard steps">
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
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 select-none',
                    isActive
                      ? 'text-amber-300 bg-amber-500/15 border border-amber-500/30'
                      : isCompleted
                      ? 'text-emerald-400 hover:bg-emerald-500/10 cursor-pointer'
                      : 'text-slate-600 cursor-default',
                  ].join(' ')}
                >
                  <span className={[
                    'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                    isActive     ? 'bg-amber-500/30 text-amber-300'
                    : isCompleted ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-white/5 text-slate-600',
                  ].join(' ')}>
                    {isCompleted ? '✓' : step.id}
                  </span>
                  <span className="hidden md:inline">{step.label}</span>
                </button>
                {idx < STEPS.length - 1 && (
                  <ChevronRight className="h-3 w-3 text-slate-700 flex-shrink-0 mx-0.5" />
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* ── Right Actions ── */}
        <div className="flex items-center gap-1.5 flex-shrink-0">

          {/* Deploy status badge */}
          <DeployStatusBadge
            state={deployState}
            isAhead={deployIsAhead}
            aheadCount={deployAheadCount}
            onClick={onOpenDeploy}
          />

          {/* Drafts */}
          <button
            onClick={onOpenDrafts}
            title="Draft Manager"
            className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/6 border border-white/8 hover:border-white/16 transition-all"
          >
            <Save className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Drafts</span>
            {draftCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-gray-900 text-[9px] font-bold flex items-center justify-center leading-none">
                {draftCount > 9 ? '9+' : draftCount}
              </span>
            )}
          </button>

          {/* Analytics */}
          <button
            onClick={onOpenAnalytics}
            title="Analytics"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/6 border border-white/8 hover:border-white/16 transition-all"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Analytics</span>
          </button>

          {/* Step counter */}
          <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-white/8 ml-1">
            <Zap className="h-3 w-3 text-amber-500 animate-pulse-gold" />
            <span className="text-xs text-slate-500">{currentStep}/5</span>
          </div>
        </div>

      </div>
    </header>
  );
};
