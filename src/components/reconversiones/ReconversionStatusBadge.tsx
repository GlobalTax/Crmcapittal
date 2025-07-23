
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ReconversionStatus, ReconversionPriority } from '@/types/Reconversion';
import { RECONVERSION_PHASES, RECONVERSION_PRIORITIES } from '@/utils/reconversionPhases';

interface ReconversionStatusBadgeProps {
  status: ReconversionStatus;
  priority?: ReconversionPriority;
  showTooltip?: boolean;
  className?: string;
}

export function ReconversionStatusBadge({ 
  status, 
  priority, 
  showTooltip = true, 
  className 
}: ReconversionStatusBadgeProps) {
  const phase = RECONVERSION_PHASES[status];
  const priorityPhase = priority ? RECONVERSION_PRIORITIES[priority] : null;

  const badge = (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant="outline" 
        className={`${phase.bgColor} ${phase.textColor} border-current/20`}
      >
        <span className="mr-1">{phase.icon}</span>
        {phase.label}
      </Badge>
      
      {priorityPhase && (
        <Badge 
          variant="outline" 
          className={`${priorityPhase.bgColor} ${priorityPhase.textColor} border-current/20`}
        >
          <span className="mr-1">{priorityPhase.icon}</span>
          {priorityPhase.label}
        </Badge>
      )}
    </div>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent side="top">
          <div className="space-y-1">
            <p className="font-medium">{phase.label}</p>
            <p className="text-xs text-muted-foreground">{phase.description}</p>
            {priorityPhase && (
              <>
                <hr className="my-1" />
                <p className="text-xs"><strong>Prioridad:</strong> {priorityPhase.label}</p>
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
