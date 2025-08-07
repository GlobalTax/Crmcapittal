import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Stage {
  id: string;
  name: string;
  color: string;
  order_index: number;
}

interface MiniPipelineComponentProps {
  currentStage?: Stage;
  onStageChange?: (stageId: string) => void;
}

export const MiniPipelineComponent: React.FC<MiniPipelineComponentProps> = ({
  currentStage,
  onStageChange
}) => {
  // Etapas predefinidas del pipeline - en implementación real vendría de la DB
  const defaultStages = [
    { id: '1', name: 'Prospecting', color: 'gray', order_index: 1 },
    { id: '2', name: 'Qualified', color: 'blue', order_index: 2 },
    { id: '3', name: 'Proposal', color: 'yellow', order_index: 3 },
    { id: '4', name: 'Negotiation', color: 'orange', order_index: 4 },
    { id: '5', name: 'Closed Won', color: 'green', order_index: 5 }
  ];

  const currentStageIndex = currentStage?.order_index || 1;

  const getDotStyle = (stage: typeof defaultStages[0]) => {
    const isActive = stage.order_index === currentStageIndex;
    const isCompleted = stage.order_index < currentStageIndex;
    const isFuture = stage.order_index > currentStageIndex;

    if (isActive) {
      return 'h-3 w-3 rounded-full bg-primary border-2 border-primary-foreground shadow-sm';
    }
    if (isCompleted) {
      return 'h-2.5 w-2.5 rounded-full bg-green-500 dark:bg-green-400';
    }
    if (isFuture) {
      return 'h-2 w-2 rounded-full bg-muted border border-border';
    }
    return 'h-2 w-2 rounded-full bg-muted';
  };

  const getConnectorStyle = (index: number) => {
    const isBeforeActive = index < currentStageIndex - 1;
    return `h-0.5 flex-1 ${isBeforeActive ? 'bg-green-500' : 'bg-muted'}`;
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 py-1">
        {defaultStages.map((stage, index) => (
          <React.Fragment key={stage.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`${getDotStyle(stage)} transition-all duration-200 hover:scale-110 cursor-pointer`}
                  onClick={() => onStageChange?.(stage.id)}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {stage.name}
                  {stage.order_index === currentStageIndex && ' (Actual)'}
                </p>
              </TooltipContent>
            </Tooltip>
            
            {index < defaultStages.length - 1 && (
              <div className={getConnectorStyle(index)} />
            )}
          </React.Fragment>
        ))}
        
        {/* Etiqueta del estado actual */}
        <div className="ml-2">
          <Badge 
            variant="outline" 
            className="text-xs h-5 px-2"
          >
            {currentStage?.name || 'Prospecting'}
          </Badge>
        </div>
      </div>
    </TooltipProvider>
  );
};