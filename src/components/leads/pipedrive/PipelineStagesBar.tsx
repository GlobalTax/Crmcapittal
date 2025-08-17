
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Lead } from '@/types/Lead';
import { PipelineStage } from '@/hooks/leads/usePipelineStages';
import { cn } from '@/lib/utils';

interface PipelineStagesBarProps {
  lead: Lead;
  stages: PipelineStage[];
  onStageChange: (stageId: string) => void;
  onWin: () => void;
  onLose: () => void;
  isUpdating?: boolean;
}

export const PipelineStagesBar = ({ 
  lead, 
  stages, 
  onStageChange, 
  onWin, 
  onLose,
  isUpdating = false 
}: PipelineStagesBarProps) => {
  const currentStageIndex = stages.findIndex(s => s.id === lead.pipeline_stage_id);
  
  return (
    <div className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Pipeline Stages with Progress Visualization */}
        <div className="flex items-center gap-1 flex-1 mr-8">
          {stages.map((stage, index) => {
            const isActive = index <= currentStageIndex;
            const isCurrent = stage.id === lead.pipeline_stage_id;
            const isClickable = !isUpdating && Math.abs(index - currentStageIndex) <= 1;
            
            return (
              <div key={stage.id} className="flex items-center">
                <button
                  onClick={() => isClickable && onStageChange(stage.id)}
                  disabled={!isClickable}
                  className={cn(
                    "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover-lift",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    {
                      'bg-primary text-primary-foreground shadow-lg scale-105': isCurrent,
                      'bg-muted text-foreground hover:bg-muted/80 hover:scale-105': !isCurrent && isActive,
                      'bg-muted/30 text-muted-foreground hover:bg-muted/50': !isActive,
                      'cursor-not-allowed opacity-50': !isClickable,
                      'animate-pulse': isUpdating && isCurrent
                    }
                  )}
                >
                  <span className="relative z-10">{stage.name}</span>
                  {isCurrent && (
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
                  )}
                </button>
                
                {/* Connector Arrow */}
                {index < stages.length - 1 && (
                  <ArrowRight 
                    className={cn(
                      "h-4 w-4 mx-2 transition-colors duration-300",
                      index < currentStageIndex ? "text-primary" : "text-muted-foreground"
                    )} 
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Win/Lose Actions */}
        <div className="flex items-center gap-3">
          {/* Progress Indicator */}
          <div className="text-sm text-muted-foreground mr-4">
            Etapa {currentStageIndex + 1} de {stages.length}
          </div>
          
          <Button
            onClick={onWin}
            className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            size="sm"
            disabled={isUpdating}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {isUpdating ? 'Actualizando...' : 'Ganado'}
          </Button>
          
          <Button
            onClick={onLose}
            variant="outline"
            size="sm"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            disabled={isUpdating}
          >
            <XCircle className="h-4 w-4 mr-2" />
            {isUpdating ? 'Actualizando...' : 'Perdido'}
          </Button>
        </div>
      </div>
      
      {/* Stage Description or Additional Info */}
      {lead.pipeline_stage_id && (
        <div className="mt-3 text-sm text-muted-foreground">
          {lead.estimated_close_date && (
            <span>
              Fecha estimada de cierre: {new Date(lead.estimated_close_date).toLocaleDateString('es-ES')}
            </span>
          )}
          {lead.probability && (
            <span className="ml-4">
              Probabilidad: {lead.probability}%
            </span>
          )}
        </div>
      )}
    </div>
  );
};
