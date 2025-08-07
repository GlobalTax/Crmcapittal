import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock } from 'lucide-react';

interface AgendaItem {
  id: string;
  title: string;
  time: Date;
  type: 'meeting' | 'call' | 'event';
  duration?: number;
}

interface CompactAgendaProps {
  items: AgendaItem[];
  maxItems?: number;
}

export const CompactAgenda: React.FC<CompactAgendaProps> = ({
  items,
  maxItems = 4
}) => {
  const todayItems = items.slice(0, maxItems);

  if (todayItems.length === 0) {
    return (
      <div className="text-sm text-slate-500 py-4">
        No hay eventos programados hoy
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {todayItems.map((item) => (
        <div key={item.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
          <div className="w-1 h-8 bg-blue-600 rounded-full flex-shrink-0" />
          
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-900 truncate">
              {item.title}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              <span>{format(item.time, 'HH:mm')}</span>
              {item.duration && (
                <>
                  <span>•</span>
                  <span>{item.duration}m</span>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};