
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TimeEntry } from '@/types/TimeTracking';

interface TimeTrackingStatsProps {
  timeEntries: TimeEntry[];
}

export const TimeTrackingStats: React.FC<TimeTrackingStatsProps> = ({ timeEntries }) => {
  const completedEntries = timeEntries.filter(entry => entry.end_time && entry.duration_minutes);
  const totalMinutes = completedEntries.reduce((total, entry) => total + (entry.duration_minutes || 0), 0);
  const billableMinutes = completedEntries
    .filter(entry => entry.is_billable)
    .reduce((total, entry) => total + (entry.duration_minutes || 0), 0);
  
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const stats = [
    {
      title: 'Tiempo Total',
      value: formatTime(totalMinutes),
      bgColor: 'bg-gray-100',
    },
    {
      title: 'Tiempo Facturable',
      value: formatTime(billableMinutes),
      bgColor: 'bg-gray-200',
    },
    {
      title: 'Sesiones',
      value: completedEntries.length.toString(),
      bgColor: 'bg-gray-300',
    },
    {
      title: 'Eficiencia',
      value: totalMinutes > 0 ? `${Math.round((billableMinutes / totalMinutes) * 100)}%` : '0%',
      bgColor: 'bg-gray-400',
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="shadow-sm border border-gray-200/60 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                <div className="w-6 h-6 bg-neutral-600 rounded-sm"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
