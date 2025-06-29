
import React from 'react';
import { Clock, Play, DollarSign } from 'lucide-react';
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
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay registros de tiempo</h3>
        <p className="text-gray-500 text-sm">
          Los registros de tiempo aparecerán aquí cuando inicies el temporizador
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-1">Resumen del Día</h3>
            <p className="text-sm text-blue-700">Total de tiempo registrado</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-900">{getTotalTime()}</div>
            <div className="text-sm text-blue-700">{timeEntries.length} sesiones</div>
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-3">
        {timeEntries.map((entry, index) => (
          <div
            key={entry.id}
            className={`bg-white rounded-lg p-4 border-l-4 ${
              entry.is_billable ? 'border-l-green-400' : 'border-l-gray-300'
            } shadow-sm border border-gray-200`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  !entry.end_time ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {!entry.end_time ? (
                    <Play className="w-4 h-4 text-green-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-600" />
                  )}
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">{formatTime(entry.start_time)}</span>
                    {entry.end_time && (
                      <>
                        <span>-</span>
                        <span className="font-medium">{formatTime(entry.end_time)}</span>
                      </>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 capitalize">
                    {entry.activity_type}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {!entry.end_time && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <Play className="w-3 h-3 mr-1" />
                    En curso
                  </Badge>
                )}
                
                {entry.duration_minutes && (
                  <span className="font-semibold text-gray-900 text-lg">
                    {formatDuration(entry.duration_minutes)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900 mb-1">
                  {entry.description || 'Sin descripción'}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {entry.is_billable && (
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                    <DollarSign className="w-3 h-3 mr-1" />
                    Facturable
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
