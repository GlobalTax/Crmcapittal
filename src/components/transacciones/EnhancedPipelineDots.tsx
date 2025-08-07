import React from 'react';
import { Transaccion } from '@/types/Transaccion';

interface EnhancedPipelineDotsProps {
  transaccion: Transaccion;
  onStageChange: (transactionId: string, stageId: string) => void;
}

export function EnhancedPipelineDots({ transaccion, onStageChange }: EnhancedPipelineDotsProps) {
  // Default stages - in real implementation, these would come from the database
  const defaultStages = [
    { id: '1', name: 'Pipeline', order_index: 1 },
    { id: '2', name: 'Cualificado', order_index: 2 },
    { id: '3', name: 'Propuesta', order_index: 3 },
    { id: '4', name: 'Negociación', order_index: 4 },
    { id: '5', name: 'Ganado', order_index: 5 },
  ];

  const currentStageIndex = transaccion.stage?.order_index || 1;

  const getDotStyle = (stage: any, index: number) => {
    const isCompleted = stage.order_index < currentStageIndex;
    const isCurrent = stage.order_index === currentStageIndex;
    
    if (isCompleted) {
      return 'w-3 h-3 rounded-full bg-green-500 cursor-pointer transition-all duration-200 hover:scale-110';
    }
    if (isCurrent) {
      return 'w-3 h-3 rounded-full bg-primary cursor-pointer transition-all duration-200 hover:scale-110';
    }
    return 'w-3 h-3 rounded-full bg-muted cursor-pointer transition-all duration-200 hover:scale-110 hover:bg-muted-foreground/50';
  };

  const handleDotClick = (stageId: string) => {
    onStageChange(transaccion.id, stageId);
  };

  return (
    <div className="flex items-center gap-2">
      {defaultStages.map((stage, index) => (
        <div
          key={stage.id}
          className={getDotStyle(stage, index)}
          onClick={() => handleDotClick(stage.id)}
          title={`${stage.name}${stage.order_index === currentStageIndex ? ' (actual)' : ''}`}
        />
      ))}
    </div>
  );
}