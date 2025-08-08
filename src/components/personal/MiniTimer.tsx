import * as React from 'react';
import { Clock, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTimeEntries } from '@/hooks/useTimeEntries';

export const MiniTimer: React.FC = () => {
  const { timeEntries } = useTimeEntries();
  const activeEntry = timeEntries.find(entry => !entry.end_time);

  const [seconds, setSeconds] = React.useState(0);
  const [isRunning, setIsRunning] = React.useState(!!activeEntry);

  React.useEffect(() => {
    if (activeEntry && !isRunning) {
      const start = new Date(activeEntry.start_time);
      const elapsed = Math.floor((Date.now() - start.getTime()) / 1000);
      setSeconds(elapsed);
      setIsRunning(true);
    }
  }, [activeEntry, isRunning]);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleToggle = () => {
    // This would integrate with the full PersonalTimer component
    setIsRunning(!isRunning);
  };

  return (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
        <Clock className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-900">
          {formatTime(seconds)}
        </span>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        className="h-6 w-6 p-0"
      >
        {isRunning ? (
          <Pause className="w-3 h-3" />
        ) : (
          <Play className="w-3 h-3" />
        )}
      </Button>
    </div>
  );
};