import React from 'react';
import { Deal } from '@/types/Deal';

interface DealProgressBarProps {
  stage: string;
  className?: string;
}

const STAGES = ['Lead', 'In Progress', 'Won', 'Lost'];
const STAGE_COLORS = {
  'Lead': '#6b7280',        // Professional gray
  'In Progress': '#f59e0b',  // Soft orange
  'Won': '#059669',         // Professional green  
  'Lost': '#dc2626'         // Soft red
} as const;

export const DealProgressBar = ({ stage, className = "" }: DealProgressBarProps) => {
  const currentStageIndex = STAGES.indexOf(stage);
  
  return (
    <div className={`flex gap-1 ${className}`}>
      {STAGES.map((stageName, index) => {
        const isCompleted = index <= currentStageIndex;
        const isCurrentStage = index === currentStageIndex;
        const color = STAGE_COLORS[stageName as keyof typeof STAGE_COLORS];
        
        return (
          <div
            key={stageName}
            className="flex-1 h-2 rounded-full bg-muted relative overflow-hidden"
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                backgroundColor: isCompleted ? color : 'transparent',
                width: isCompleted ? '100%' : '0%'
              }}
            />
            {isCurrentStage && (
              <div
                className="absolute inset-0 rounded-full animate-pulse"
                style={{
                  backgroundColor: color,
                  opacity: 0.3
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};