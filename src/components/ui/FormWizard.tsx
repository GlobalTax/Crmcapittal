import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WizardStep {
  id: number;
  title: string;
  description?: string;
}

interface FormWizardProps {
  currentStep: number;
  totalSteps: number;
  steps: WizardStep[];
  onNext?: () => void;
  onPrev?: () => void;
  onStepClick?: (step: number) => void;
  canGoNext?: boolean;
  canGoPrev?: boolean;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const FormWizard = ({
  currentStep,
  totalSteps,
  steps,
  onNext,
  onPrev,
  onStepClick,
  canGoNext = true,
  canGoPrev = true,
  children,
  actions
}: FormWizardProps) => {
  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            
            return (
              <div
                key={step.id}
                className={`flex items-center ${index !== steps.length - 1 ? 'flex-1' : ''}`}
              >
                <button
                  onClick={() => onStepClick?.(stepNumber)}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-blue-600 text-white' 
                      : isCompleted 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-500'
                    }
                    ${onStepClick ? 'hover:bg-blue-50 cursor-pointer' : ''}
                  `}
                  disabled={!onStepClick}
                >
                  {stepNumber}
                </button>
                {index !== steps.length - 1 && (
                  <div className={`flex-1 h-px mx-2 ${isCompleted ? 'bg-green-200' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Title */}
      <div className="text-center space-y-1">
        <h3 className="text-lg font-medium text-gray-900">
          {steps[currentStep - 1]?.title}
        </h3>
        {steps[currentStep - 1]?.description && (
          <p className="text-sm text-gray-600">
            {steps[currentStep - 1].description}
          </p>
        )}
      </div>

      {/* Content */}
      <div>{children}</div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          disabled={!canGoPrev || currentStep === 1}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        <span className="text-sm text-gray-500">
          Paso {currentStep} de {totalSteps}
        </span>

        {currentStep === totalSteps ? (
          actions
        ) : (
          <Button
            type="button"
            onClick={onNext}
            disabled={!canGoNext}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};