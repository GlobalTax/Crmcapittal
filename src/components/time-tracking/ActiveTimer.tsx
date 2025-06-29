
import React, { useState, useEffect } from 'react';
import { Play, Square, Pause } from 'lucide-react';
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
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Play className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay temporizador activo</h3>
        <p className="text-gray-500 text-sm">
          Inicia una tarea desde tu plan del día para comenzar a medir el tiempo
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      {/* Timer Display */}
      <div className="relative mb-8">
        <div className="w-32 h-32 bg-gradient-to-br from-neutral-600 to-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <div className="text-white">
            <div className="text-2xl font-mono font-bold leading-none">
              {formatTime(elapsedSeconds)}
            </div>
          </div>
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-neutral-500 rounded-full border-4 border-white animate-pulse"></div>
      </div>

      {/* Task Info */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {activeTimer.description || 'Tarea sin título'}
        </h3>
        <p className="text-sm text-gray-500">
          Iniciado a las {new Date(activeTimer.start_time).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
      
      {/* Stop Button */}
      <Button 
        onClick={onStopTimer}
        size="lg"
        className="bg-neutral-800 hover:bg-neutral-900 text-white px-8 py-3 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
      >
        <Square className="w-5 h-5 mr-2" />
        Detener Temporizador
      </Button>
    </div>
  );
};
