
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExportProgressProps {
  isVisible: boolean;
  progress: {
    current: number;
    total: number;
    percentage: number;
    message: string;
  };
  onCancel?: () => void;
}

export const ExportProgress: React.FC<ExportProgressProps> = ({
  isVisible,
  progress,
  onCancel
}) => {
  if (!isVisible) return null;
  
  const isComplete = progress.percentage >= 100;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-96 max-w-[90vw]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              {isComplete ? (
                <Download className="h-5 w-5 text-green-600" />
              ) : (
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              )}
              <h3 className="font-semibold">
                {isComplete ? 'Exportación Completada' : 'Exportando Datos'}
              </h3>
            </div>
            
            {onCancel && !isComplete && (
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="space-y-3">
            <Progress value={progress.percentage} className="w-full" />
            
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{progress.current} / {progress.total}</span>
              <span>{progress.percentage}%</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {progress.message}
            </p>
          </div>
          
          {isComplete && (
            <div className="mt-4 text-center">
              <p className="text-sm text-green-600 font-medium">
                ✅ Descarga iniciada automáticamente
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
