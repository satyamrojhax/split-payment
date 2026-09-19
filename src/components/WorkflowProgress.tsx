import React from 'react';
import { Check } from 'lucide-react';

export type WorkflowStep = 'upload' | 'configure' | 'confirm' | 'results';

interface WorkflowProgressProps {
  currentStep: WorkflowStep;
  onStepClick?: (step: WorkflowStep) => void;
  canNavigateTo?: (step: WorkflowStep) => boolean;
}

export const WorkflowProgress: React.FC<WorkflowProgressProps> = ({
  currentStep,
  onStepClick,
  canNavigateTo,
}) => {
  const steps: { id: WorkflowStep; label: string; num: string }[] = [
    { id: 'upload', label: 'Details', num: '1' },
    { id: 'configure', label: 'Split', num: '2' },
    { id: 'confirm', label: 'Review', num: '3' },
    { id: 'results', label: 'Pay', num: '4' },
  ];

  const stepOrder: Record<WorkflowStep, number> = {
    upload: 1,
    configure: 2,
    confirm: 3,
    results: 4,
  };

  const currentOrder = stepOrder[currentStep];

  return (
    <nav aria-label="Workflow Steps" className="w-full max-w-xl mx-auto py-1 px-2 no-print">
      <div className="flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-[1px] bg-neutral-200 dark:bg-neutral-800 z-0" />

        {steps.map((step) => {
          const order = stepOrder[step.id];
          const isCompleted = order < currentOrder;
          const isCurrent = order === currentOrder;
          const isClickable = canNavigateTo ? canNavigateTo(step.id) : isCompleted;

          return (
            <button
              key={step.id}
              disabled={!isClickable && !isCurrent}
              onClick={() => isClickable && onStepClick?.(step.id)}
              className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-semibold ${
                isCurrent
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : isCompleted
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 cursor-pointer'
                  : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-600 border border-transparent cursor-not-allowed'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isCurrent
                    ? 'bg-white text-black dark:bg-black dark:text-white'
                    : isCompleted
                    ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black'
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-500'
                }`}
              >
                {isCompleted ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : step.num}
              </span>
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
