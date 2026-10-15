import React from 'react';
import { Check } from 'lucide-react';
import { RegistrationStep } from './types';

interface WizardProgressProps {
  currentStep: RegistrationStep;
  onStepClick?: (step: RegistrationStep) => void;
  maxAccessibleStep?: RegistrationStep;
}

const STEPS: { step: RegistrationStep; label: string; shortLabel: string }[] = [
  { step: 1, label: 'Doctor Account', shortLabel: 'Account' },
  { step: 2, label: 'Professional Details', shortLabel: 'Credentials' },
  { step: 3, label: 'Clinic & Location', shortLabel: 'Location' },
  { step: 4, label: 'Schedule Settings', shortLabel: 'Schedule' },
  { step: 5, label: 'Review & Complete', shortLabel: 'Review' },
];

export const WizardProgress: React.FC<WizardProgressProps> = ({
  currentStep,
  onStepClick,
  maxAccessibleStep = currentStep,
}) => {
  return (
    <nav aria-label="Registration Progress" className="w-full">
      <ol className="grid grid-cols-5 gap-1 sm:gap-2">
        {STEPS.map((s) => {
          const isCurrent = s.step === currentStep;
          const isCompleted = s.step < currentStep;
          const isClickable = onStepClick && s.step <= maxAccessibleStep;

          return (
            <li key={s.step} className="relative">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick?.(s.step)}
                aria-current={isCurrent ? 'step' : undefined}
                className={`w-full text-left py-2 px-1.5 sm:px-3 rounded-lg border transition-all duration-150 flex flex-col sm:flex-row items-center sm:items-start gap-1.5 sm:gap-2.5 ${
                  isCurrent
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : isCompleted
                    ? 'bg-teal-50/70 border-teal-200 text-teal-900 hover:bg-teal-100/60'
                    : 'bg-white border-slate-200 text-slate-400'
                } ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                    isCurrent
                      ? 'bg-teal-400 text-slate-900'
                      : isCompleted
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3 stroke-[2.5]" /> : s.step}
                </span>

                <div className="text-center sm:text-left min-w-0">
                  <span className="hidden sm:block text-[10px] uppercase tracking-wider font-semibold opacity-75">
                    Step 0{s.step}
                  </span>
                  <span className="block text-xs font-semibold truncate">
                    <span className="sm:hidden">{s.shortLabel}</span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
