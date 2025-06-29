
import React from 'react';
import { Play, Clock, CheckCircle, Pause, Circle } from 'lucide-react';
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
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          icon: Circle,
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          text: 'Pendiente',
          iconColor: 'text-gray-400'
        };
      case 'IN_PROGRESS':
        return {
          icon: Play,
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          text: 'En Progreso',
          iconColor: 'text-blue-500'
        };
      case 'COMPLETED':
        return {
          icon: CheckCircle,
          color: 'bg-green-100 text-green-700 border-green-200',
          text: 'Completado',
          iconColor: 'text-green-500'
        };
      case 'ON_HOLD':
        return {
          icon: Pause,
          color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          text: 'En Pausa',
          iconColor: 'text-yellow-500'
        };
      default:
        return {
          icon: Circle,
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          text: status,
          iconColor: 'text-gray-400'
        };
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tareas planificadas</h3>
        <p className="text-gray-500 text-sm">
          Crea una nueva tarea para comenzar a organizar tu día
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const statusConfig = getStatusConfig(task.status);
        
        return (
          <div
            key={task.id}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <statusConfig.icon className={`w-5 h-5 ${statusConfig.iconColor}`} />
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                </div>
                
                {task.description && (
                  <p className="text-sm text-gray-600 mb-3 ml-8">{task.description}</p>
                )}
                
                <div className="flex items-center gap-3 ml-8">
                  <Badge variant="outline" className={statusConfig.color}>
                    {statusConfig.text}
                  </Badge>
                  
                  {task.estimated_duration && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {task.estimated_duration} min
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
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Iniciar
                  </Button>
                )}
                
                {task.status === 'IN_PROGRESS' && (
                  <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                    <Play className="w-3 h-3 mr-1" />
                    En curso
                  </Badge>
                )}
                
                {task.status === 'COMPLETED' && (
                  <Badge className="bg-green-100 text-green-800 px-3 py-1">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completado
                  </Badge>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
