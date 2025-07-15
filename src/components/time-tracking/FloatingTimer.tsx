import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Timer, Square, ChevronUp, ChevronDown } from 'lucide-react';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { cn } from '@/lib/utils';

interface FloatingTimerProps {
  className?: string;
}

export const FloatingTimer = ({ className }: FloatingTimerProps) => {
  const today = new Date().toISOString().split('T')[0];
  const { dailyData, isTimerRunning, stopTimer, getElapsedTime } = useTimeTracking(today);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Update elapsed time every second when timer is running
  useEffect(() => {
    if (!isTimerRunning || !dailyData?.activeTimer) {
      setElapsedSeconds(0);
      return;
    }

    const updateElapsed = () => {
      setElapsedSeconds(getElapsedTime());
    };

    updateElapsed(); // Initial update
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, dailyData?.activeTimer, getElapsedTime]);

  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStopTimer = async () => {
    try {
      await stopTimer();
    } catch (error) {
      console.error('Error stopping timer:', error);
    }
  };

  if (!isTimerRunning || !dailyData?.activeTimer) {
    return null;
  }

  return (
    <Card className={cn(
      "fixed bottom-6 right-6 z-50 shadow-lg border-primary/20 bg-background/95 backdrop-blur-sm",
      "transition-all duration-300 ease-in-out",
      isExpanded ? "w-80" : "w-64",
      className
    )}>
      <div className="p-4">
        {/* Compact View */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <div>
              <div className="font-mono font-bold text-lg">
                {formatElapsedTime(elapsedSeconds)}
              </div>
              <div className="text-xs text-muted-foreground">
                Timer activo
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleStopTimer}
              className="h-8 px-3"
            >
              <Square className="h-3 w-3 mr-1" />
              Parar
            </Button>
          </div>
        </div>

        {/* Expanded View */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border space-y-3">
            <div>
              <div className="text-sm font-medium mb-1">
                Actividad: {dailyData.activeTimer.activity_type}
              </div>
              {dailyData.activeTimer.description && (
                <div className="text-xs text-muted-foreground">
                  {dailyData.activeTimer.description}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Iniciado: {new Date(dailyData.activeTimer.start_time).toLocaleTimeString('es-ES')}</span>
              <Badge variant={dailyData.activeTimer.is_billable ? 'default' : 'secondary'} className="text-xs">
                {dailyData.activeTimer.is_billable ? 'Facturable' : 'No facturable'}
              </Badge>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};