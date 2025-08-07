import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ActivityItem {
  id: string;
  message: string;
  timestamp: Date;
  type: 'lead' | 'deal' | 'task' | 'call' | 'email';
}

interface InlineActivityFeedProps {
  activities: ActivityItem[];
  maxItems?: number;
}

export const InlineActivityFeed: React.FC<InlineActivityFeedProps> = ({
  activities,
  maxItems = 5
}) => {
  const recentActivities = activities.slice(0, maxItems);

  if (recentActivities.length === 0) {
    return (
      <div className="text-sm text-slate-500 py-4">
        No hay actividad reciente
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {recentActivities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full flex-shrink-0 mt-2" />
          
          <div className="flex-1 min-w-0">
            <div className="text-sm text-slate-900">
              {activity.message}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {format(activity.timestamp, 'HH:mm', { locale: es })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};