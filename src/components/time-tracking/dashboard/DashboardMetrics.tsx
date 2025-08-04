import React from 'react';

interface DashboardMetricsProps {
  totalMinutesToday: number;
  billableMinutesToday: number;
  completedTasks: number;
  totalTasks: number;
  isTimerRunning: boolean;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  totalMinutesToday,
  billableMinutesToday,
  completedTasks,
  totalTasks,
  isTimerRunning
}) => {
  const formatDecimalTime = (minutes: number) => {
    return (minutes / 60).toFixed(1) + 'h';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 border rounded-lg">
        <div className="text-2xl font-bold">{formatDecimalTime(totalMinutesToday)}</div>
        <div className="text-sm text-muted-foreground">Tiempo hoy</div>
      </div>

      <div className="p-4 border rounded-lg">
        <div className="text-2xl font-bold">{formatDecimalTime(billableMinutesToday)}</div>
        <div className="text-sm text-muted-foreground">Facturable</div>
      </div>

      <div className="p-4 border rounded-lg">
        <div className="text-2xl font-bold">{completedTasks}/{totalTasks}</div>
        <div className="text-sm text-muted-foreground">Tareas</div>
      </div>

      <div className="p-4 border rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          {isTimerRunning ? (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          ) : (
            <div className="w-2 h-2 bg-gray-400 rounded-full" />
          )}
          <div className="text-2xl font-bold">{isTimerRunning ? 'ON' : 'OFF'}</div>
        </div>
        <div className="text-sm text-muted-foreground">Timer</div>
      </div>
    </div>
  );
};