
import React, { useState, useEffect } from 'react';
import { Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimeEntry } from '@/types/TimeTracking';

interface ActiveTimerProps {
  activeTimer?: TimeEntry;
  isTimerRunning: boolean;
  onStopTimer: () => void;
}

export const ActiveTimer: React.FC<ActiveTimerProps> = ({
  activeTimer,
  isTimerRunning,
  onStopTimer
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerRunning && activeTimer) {
      interval = setInterval(() => {
        const startTime = new Date(activeTimer.start_time);
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedSeconds(elapsed);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, activeTimer]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isTimerRunning || !activeTimer) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <Play className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        </div>
        <p className="text-gray-500 mb-4">No hay temporizador activo</p>
        <p className="text-sm text-gray-400">
          Inicia una tarea desde tu plan del día o usa el temporizador manual
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-900">
          {activeTimer.description || 'Tarea sin título'}
        </h3>
        <div className="text-4xl font-mono font-bold text-blue-600 mb-4">
          {formatTime(elapsedSeconds)}
        </div>
        <p className="text-sm text-gray-500">
          Iniciado a las {new Date(activeTimer.start_time).toLocaleTimeString()}
        </p>
      </div>
      
      <Button 
        onClick={onStopTimer}
        size="lg"
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        <Square className="w-5 h-5 mr-2" />
        Detener Temporizador
      </Button>
    </div>
  );
};
