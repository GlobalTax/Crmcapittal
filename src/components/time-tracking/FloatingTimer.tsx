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
    <div className={cn(
      "fixed bottom-4 right-4 z-50 bg-background border rounded-lg shadow-lg p-3",
      "transition-all duration-200",
      className
    )}>
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <div className="font-mono text-lg font-bold">
          {formatElapsedTime(elapsedSeconds)}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleStopTimer}
          className="h-6 px-2 text-xs"
        >
          Stop
        </Button>
      </div>
    </div>
  );
};