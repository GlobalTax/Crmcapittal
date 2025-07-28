import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useLeadTasks, LeadTask } from '@/hooks/leads/useLeadTasks';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';

interface LeadTasksListProps {
  leadId: string;
}

const priorityConfig = {
  low: { label: 'Baja', variant: 'secondary' as const, icon: Clock },
  medium: { label: 'Media', variant: 'default' as const, icon: Clock },
  high: { label: 'Alta', variant: 'destructive' as const, icon: AlertTriangle },
  urgent: { label: 'Urgente', variant: 'destructive' as const, icon: AlertTriangle },
};

const statusConfig = {
  pending: { label: 'Pendiente', variant: 'secondary' as const },
  in_progress: { label: 'En progreso', variant: 'default' as const },
  completed: { label: 'Completada', variant: 'outline' as const },
  cancelled: { label: 'Cancelada', variant: 'destructive' as const },
};

export const LeadTasksList = ({ leadId }: LeadTasksListProps) => {
  const { tasks, isLoading, completeTask, isCompleting } = useLeadTasks(leadId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Tareas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Cargando tareas...</div>
        </CardContent>
      </Card>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Tareas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No hay tareas para este lead.</div>
        </CardContent>
      </Card>
    );
  }

  const handleTaskComplete = (task: LeadTask) => {
    if (task.status !== 'completed') {
      completeTask(task.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Tareas ({tasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task) => {
          const priorityInfo = priorityConfig[task.priority];
          const statusInfo = statusConfig[task.status];
          const PriorityIcon = priorityInfo.icon;
          const isCompleted = task.status === 'completed';
          const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted;

          return (
            <div
              key={task.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                isCompleted ? 'bg-muted/50' : 'bg-background'
              }`}
            >
              <Checkbox
                checked={isCompleted}
                onCheckedChange={() => handleTaskComplete(task)}
                disabled={isCompleting || isCompleted}
                className="mt-0.5"
              />
              
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className={`text-sm font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-1">
                    <PriorityIcon className="h-3 w-3" />
                    <Badge variant={priorityInfo.variant} className="text-xs">
                      {priorityInfo.label}
                    </Badge>
                  </div>
                </div>
                
                {task.description && (
                  <p className={`text-xs ${isCompleted ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                    {task.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={statusInfo.variant} className="text-xs">
                      {statusInfo.label}
                    </Badge>
                    
                    {task.due_date && (
                      <div className={`flex items-center gap-1 text-xs ${
                        isOverdue ? 'text-destructive' : 'text-muted-foreground'
                      }`}>
                        <Calendar className="h-3 w-3" />
                        {isOverdue ? 'Vencida' : 'Vence'} {formatDistanceToNow(new Date(task.due_date), {
                          addSuffix: true,
                          locale: es
                        })}
                      </div>
                    )}
                  </div>
                  
                  {isCompleted && task.completed_at && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CheckCircle className="h-3 w-3" />
                      Completada {formatDistanceToNow(new Date(task.completed_at), {
                        addSuffix: true,
                        locale: es
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};