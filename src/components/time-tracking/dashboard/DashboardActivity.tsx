import React from 'react';
import { DailyTimeData } from '@/types/TimeTracking';

interface DashboardActivityProps {
  dailyData: DailyTimeData;
}

export const DashboardActivity: React.FC<DashboardActivityProps> = ({ dailyData }) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (dailyData.timeEntries.length === 0) {
    return null;
  }

  const activitySummary = dailyData.timeEntries
    .reduce((acc, entry) => {
      const type = entry.activity_type;
      const existing = acc.find(item => item.type === type);
      if (existing) {
        existing.minutes += entry.duration_minutes || 0;
      } else {
        acc.push({ type, minutes: entry.duration_minutes || 0 });
      }
      return acc;
    }, [] as Array<{ type: string; minutes: number }>)
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 5);

  return (
    <div className="p-4 border rounded-lg">
      <div className="text-sm font-medium mb-3">Actividad del día</div>
      <div className="space-y-2">
        {activitySummary.map(({ type, minutes }) => (
          <div key={type} className="flex justify-between text-sm">
            <span className="capitalize">{type}</span>
            <span className="font-mono">{formatTime(minutes)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};