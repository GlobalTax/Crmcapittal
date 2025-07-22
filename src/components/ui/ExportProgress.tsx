
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ExportProgressProps {
  isVisible: boolean;
  progress: number;
  onCancel: () => void;
}

export const ExportProgress: React.FC<ExportProgressProps> = ({
  isVisible,
  progress,
  onCancel
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-card rounded-lg shadow-lg border p-4 z-50 animate-in slide-in-from-bottom-5">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Exportando datos</h3>
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-6 w-6">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{progress}% completado</span>
          {progress < 100 && (
            <Button variant="ghost" size="sm" className="h-6 px-2 py-0 text-xs" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
