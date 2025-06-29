
import React from 'react';
import { Play, Clock, CheckCircle, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlannedTask } from '@/types/TimeTracking';

interface DailyTaskListProps {
  tasks: PlannedTask[];
  onStartTimer: (taskId: string) => void;
  isTimerRunning: boolean;
}

export const DailyTaskList: React.FC<DailyTaskListProps> = ({
  tasks,
  onStartTimer,
  isTimerRunning
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'ON_HOLD': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'IN_PROGRESS': return <Play className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'ON_HOLD': return <Pause className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'IN_PROGRESS': return 'En Progreso';
      case 'COMPLETED': return 'Completado';
      case 'ON_HOLD': return 'En Pausa';
      default: return status;
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>No hay tareas planificadas para hoy</p>
        <p className="text-sm mt-2">Añade una tarea para comenzar</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
              
              {task.description && (
                <p className="text-sm text-gray-600 mb-3">{task.description}</p>
              )}
              
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(task.status)}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(task.status)}
                    {getStatusText(task.status)}
                  </span>
                </Badge>
                
                {task.estimated_duration && (
                  <span className="text-xs text-gray-500">
                    Estimado: {task.estimated_duration} min
                  </span>
                )}
              </div>
            </div>
            
            <div className="ml-4 flex-shrink-0">
              {task.status === 'PENDING' && (
                <Button
                  onClick={() => onStartTimer(task.id)}
                  disabled={isTimerRunning}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Iniciar
                </Button>
              )}
              
              {task.status === 'IN_PROGRESS' && (
                <Badge className="bg-blue-100 text-blue-800">
                  En curso
                </Badge>
              )}
              
              {task.status === 'COMPLETED' && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Completado
                </Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
