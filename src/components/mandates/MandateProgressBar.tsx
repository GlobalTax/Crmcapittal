import React from 'react';
import { Progress } from '@/components/ui/progress';

interface MandateProgressBarProps {
  status: string;
}

export const MandateProgressBar = ({ status }: MandateProgressBarProps) => {
  const getProgress = (status: string) => {
    const progressMap: Record<string, number> = {
      'active': 75,
      'paused': 50,
      'completed': 100,
      'cancelled': 25
    };
    return progressMap[status] || 0;
  };

  const getProgressColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'active': 'bg-success',
      'paused': 'bg-warning',
      'completed': 'bg-info',
      'cancelled': 'bg-error'
    };
    return colorMap[status] || 'bg-muted';
  };

  const progress = getProgress(status);

  return (
    <div className="space-y-1">
      <Progress 
        value={progress} 
        className="h-2"
        style={{
          '--progress-background': `hsl(var(--${getProgressColor(status).replace('bg-', '')}))`
        } as React.CSSProperties}
      />
      <p className="text-xs text-muted-foreground text-right">
        {progress}% completado
      </p>
    </div>
  );
};