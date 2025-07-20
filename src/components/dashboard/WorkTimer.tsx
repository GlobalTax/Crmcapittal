import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkTimerProps {
  className?: string;
}

export const WorkTimer: React.FC<WorkTimerProps> = ({ className }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleStop = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  return (
    <div className={cn("bg-card border rounded-lg p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-card-foreground">Timer de Trabajo</h3>
        <div className={cn(
          "w-3 h-3 rounded-full",
          isRunning ? "bg-success animate-pulse" : "bg-muted"
        )} />
      </div>
      
      <div className="text-center mb-6">
        <div className="text-4xl font-mono font-bold text-card-foreground mb-2">
          {formatTime(seconds)}
        </div>
        <p className="text-sm text-muted-foreground">
          {isRunning ? "Trabajando..." : "Timer detenido"}
        </p>
      </div>
      
      <div className="flex justify-center gap-2">
        {!isRunning ? (
          <Button 
            onClick={handleStart}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Iniciar
          </Button>
        ) : (
          <Button 
            onClick={handlePause}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Pause className="w-4 h-4" />
            Pausar
          </Button>
        )}
        
        <Button 
          onClick={handleStop}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Square className="w-4 h-4" />
          Detener
        </Button>
      </div>
    </div>
  );
};