
import React from 'react';
import { Clock, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TimeEntry } from '@/types/TimeTracking';

interface TimeSheetProps {
  timeEntries: TimeEntry[];
}

export const TimeSheet: React.FC<TimeSheetProps> = ({ timeEntries }) => {
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getTotalTime = () => {
    const completedEntries = timeEntries.filter(entry => entry.end_time && entry.duration_minutes);
    const totalMinutes = completedEntries.reduce((total, entry) => total + (entry.duration_minutes || 0), 0);
    return formatDuration(totalMinutes);
  };

  if (timeEntries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>No hay entradas de tiempo para hoy</p>
        <p className="text-sm mt-2">Las entradas aparecerán aquí cuando inicies el temporizador</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="font-medium text-blue-900">Tiempo total del día:</span>
          <span className="text-lg font-bold text-blue-900">{getTotalTime()}</span>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-3">
        {timeEntries.map((entry) => (
          <div
            key={entry.id}
            className="border rounded-lg p-4 bg-white"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {formatTime(entry.start_time)}
                  {entry.end_time && (
                    <span> - {formatTime(entry.end_time)}</span>
                  )}
                </div>
                
                {!entry.end_time && (
                  <Badge className="bg-green-100 text-green-800">
                    <Play className="w-3 h-3 mr-1" />
                    En curso
                  </Badge>
                )}
              </div>
              
              {entry.duration_minutes && (
                <span className="font-medium text-gray-900">
                  {formatDuration(entry.duration_minutes)}
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {entry.description || 'Sin descripción'}
                </p>
                <p className="text-sm text-gray-500 capitalize">
                  {entry.activity_type}
                </p>
              </div>
              
              {entry.is_billable && (
                <Badge variant="outline" className="text-green-600 border-green-200">
                  Facturable
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
