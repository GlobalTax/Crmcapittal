import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Play, Pause, Square } from 'lucide-react';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PersonalTimerProps {
  className?: string;
}

export const PersonalTimer = ({ className }: PersonalTimerProps) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { createTimeEntry, timeEntries, isCreating } = useTimeEntries();

  // Check if there's an active timer from database
  const activeEntry = timeEntries.find(entry => !entry.end_time);

  useEffect(() => {
    if (activeEntry && !isRunning) {
      // Resume from database timer
      const start = new Date(activeEntry.start_time);
      const elapsed = Math.floor((Date.now() - start.getTime()) / 1000);
      setSeconds(elapsed);
      setStartTime(start);
      setIsRunning(true);
    }
  }, [activeEntry, isRunning]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    if (activeEntry) {
      // Resume existing timer
      setIsRunning(true);
      return;
    }

    // Start new timer
    const now = new Date();
    setStartTime(now);
    setSeconds(0);
    setIsRunning(true);

    try {
      await createTimeEntry({
        activity_type: 'general',
        description: 'Trabajo general',
        start_time: now.toISOString(),
        is_billable: false
      });
    } catch (error) {
      console.error('Error starting timer:', error);
      setIsRunning(false);
      toast.error('Error al iniciar el timer');
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = async () => {
    if (!activeEntry || !startTime) {
      setIsRunning(false);
      setSeconds(0);
      setStartTime(null);
      return;
    }

    setIsRunning(false);
    const duration = Math.floor(seconds / 60); // Convert to minutes

    try {
      // Update the active entry with end time
      const { error } = await supabase
        .from('time_entries')
        .update({
          end_time: new Date().toISOString(),
          duration_minutes: duration
        })
        .eq('id', activeEntry.id);

      if (error) throw error;

      setSeconds(0);
      setStartTime(null);
      toast.success(`Timer parado. Registradas ${duration} minutos`);
    } catch (error) {
      console.error('Error stopping timer:', error);
      toast.error('Error al parar el timer');
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m`;
    }
    return `${seconds}s`;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Timer Personal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer Display */}
        <div className="text-center">
          <div className="text-3xl font-mono font-bold text-foreground mb-2">
            {formatTime(seconds)}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatDuration(seconds)} registrados
          </div>
        </div>

        {/* Timer Status */}
        <div className="flex items-center justify-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
          <span className="text-sm text-muted-foreground">
            {isRunning ? 'En curso' : 'Detenido'}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {!isRunning ? (
            <Button 
              onClick={handleStart} 
              className="flex-1"
              disabled={isCreating}
            >
              <Play className="h-4 w-4 mr-2" />
              {activeEntry ? 'Reanudar' : 'Iniciar'}
            </Button>
          ) : (
            <Button 
              onClick={handlePause} 
              variant="outline" 
              className="flex-1"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pausar
            </Button>
          )}
          
          <Button 
            onClick={handleStop} 
            variant="destructive" 
            size="sm"
            disabled={!isRunning && !activeEntry}
          >
            <Square className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Stats */}
        {activeEntry && (
          <div className="pt-3 border-t">
            <div className="text-xs text-muted-foreground text-center">
              Iniciado: {new Date(activeEntry.start_time).toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};