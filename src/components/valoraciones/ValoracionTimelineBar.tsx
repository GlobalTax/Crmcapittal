
import React from 'react';
import { ValoracionStatus } from '@/types/Valoracion';
import { VALORACION_PHASES, getPhaseOrder, getPhaseIndex } from '@/utils/valoracionPhases';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronRight } from 'lucide-react';

interface ValoracionTimelineBarProps {
  currentStatus: ValoracionStatus;
  onAdvancePhase?: (nextPhase: ValoracionStatus) => void;
  canEdit?: boolean;
  className?: string;
}

export const ValoracionTimelineBar = ({ 
  currentStatus, 
  onAdvancePhase, 
  canEdit = false,
  className = "" 
}: ValoracionTimelineBarProps) => {
  const phases = getPhaseOrder();
  const currentIndex = getPhaseIndex(currentStatus);

  const handleAdvance = () => {
    if (currentIndex < phases.length - 1 && onAdvancePhase) {
      const nextPhase = phases[currentIndex + 1];
      onAdvancePhase(nextPhase);
    }
  };

  const canAdvance = canEdit && currentIndex < phases.length - 1;

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 p-4 bg-muted/30 rounded-lg ${className}`}>
        {phases.map((phaseKey, index) => {
          const phase = VALORACION_PHASES[phaseKey];
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;

          return (
            <React.Fragment key={phaseKey}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center">
                    {/* Phase Circle */}
                    <div 
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium transition-all duration-300
                        ${isCompleted ? 'bg-green-500 text-white' : ''}
                        ${isCurrent ? `bg-blue-500 text-white animate-pulse` : ''}
                        ${isFuture ? 'bg-gray-200 text-gray-400' : ''}
                      `}
                    >
                      {isCompleted ? '✓' : phase.icon}
                    </div>
                    
                    {/* Phase Label */}
                    <span 
                      className={`
                        mt-2 text-xs font-medium text-center
                        ${isCompleted ? 'text-green-600' : ''}
                        ${isCurrent ? 'text-blue-600' : ''}
                        ${isFuture ? 'text-gray-400' : ''}
                      `}
                    >
                      {phase.label}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="max-w-48">
                    <p className="font-medium">{phase.label}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {phase.description}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>

              {/* Connector Line */}
              {index < phases.length - 1 && (
                <div 
                  className={`
                    flex-1 h-0.5 mx-2 transition-all duration-300
                    ${index < currentIndex ? 'bg-green-500' : 'bg-gray-200'}
                  `} 
                />
              )}
            </React.Fragment>
          );
        })}

        {/* Advance Button */}
        {canAdvance && (
          <Button
            onClick={handleAdvance}
            size="sm"
            className="ml-4 animate-pulse"
          >
            <ChevronRight className="w-4 h-4 mr-1" />
            Avanzar Fase
          </Button>
        )}
      </div>
    </TooltipProvider>
  );
};
