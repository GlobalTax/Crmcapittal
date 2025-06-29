
import React from 'react';
import { Clock, Target, TrendingUp, Calendar } from 'lucide-react';
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
      icon: Clock,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Tiempo Facturable',
      value: formatTime(billableMinutes),
      icon: Target,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Sesiones',
      value: completedEntries.length.toString(),
      icon: TrendingUp,
      bgColor: 'bg-slate-50',
      iconColor: 'text-slate-600'
    },
    {
      title: 'Eficiencia',
      value: totalMinutes > 0 ? `${Math.round((billableMinutes / totalMinutes) * 100)}%` : '0%',
      icon: Calendar,
      bgColor: 'bg-slate-50',
      iconColor: 'text-slate-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="shadow-sm border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
