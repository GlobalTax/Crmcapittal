import { cn } from '@/lib/utils';
import { FileText, HandCoins, Users, Settings, Eye, Check } from 'lucide-react';

interface StepperNavigationProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

const steps = [
  {
    id: 1,
    title: 'Información General',
    description: 'Datos básicos de la ROD',
    icon: FileText,
  },
  {
    id: 2,
    title: 'Mandatos de Venta',
    description: 'Añadir mandatos',
    icon: HandCoins,
  },
  {
    id: 3,
    title: 'Leads Potenciales',
    description: 'Añadir leads',
    icon: Users,
  },
  {
    id: 4,
    title: 'Configuración',
    description: 'Ajustes de generación',
    icon: Settings,
  },
  {
    id: 5,
    title: 'Vista Previa',
    description: 'Revisar y generar',
    icon: Eye,
  },
];

export function StepperNavigation({ currentStep, onStepClick }: StepperNavigationProps) {
  return (
    <nav className="mb-8">
      <ol className="flex items-center justify-between w-full">
        {steps.map((step, stepIdx) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isClickable = currentStep >= step.id;
          
          return (
            <li key={step.id} className="flex-1">
              <div className="flex items-center">
                {/* Step button */}
                <button
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    "group relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
                    {
                      "border-primary bg-primary text-primary-foreground": isCurrent || isCompleted,
                      "border-muted-foreground/30 bg-background text-muted-foreground": !isCurrent && !isCompleted,
                      "hover:border-primary hover:bg-primary/10 cursor-pointer": isClickable && !isCurrent,
                      "cursor-not-allowed": !isClickable,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </button>

                {/* Step content */}
                <div className="ml-4 flex-1 hidden md:block">
                  <p className={cn(
                    "text-sm font-medium transition-colors",
                    {
                      "text-primary": isCurrent || isCompleted,
                      "text-muted-foreground": !isCurrent && !isCompleted,
                    }
                  )}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>

                {/* Connector line */}
                {stepIdx < steps.length - 1 && (
                  <div className="flex-1 ml-4 hidden md:block">
                    <div
                      className={cn(
                        "h-0.5 w-full transition-colors",
                        {
                          "bg-primary": isCompleted,
                          "bg-muted": !isCompleted,
                        }
                      )}
                    />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Mobile step indicator */}
      <div className="mt-4 md:hidden">
        <div className="text-center">
          <p className="text-sm font-medium">
            Paso {currentStep} de {steps.length}
          </p>
          <p className="text-sm text-muted-foreground">
            {steps[currentStep - 1]?.title}
          </p>
        </div>
        <div className="mt-2 h-2 bg-muted rounded-full">
          <div 
            className="h-2 bg-primary rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </nav>
  );
}