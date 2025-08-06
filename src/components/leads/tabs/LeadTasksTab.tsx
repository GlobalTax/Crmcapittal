
import { Lead } from '@/types/Lead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, CheckSquare, Clock, AlertCircle } from 'lucide-react';

interface LeadTasksTabProps {
  lead: Lead;
}

export const LeadTasksTab = ({ lead }: LeadTasksTabProps) => {
  // Mock tasks data - en una implementación real esto vendría de una query
  const tasks = [
    {
      id: '1',
      title: 'Llamar para seguimiento',
      description: 'Contactar al lead para conocer su interés',
      status: 'pending',
      priority: 'high',
      due_date: '2024-01-20',
    },
    {
      id: '2',
      title: 'Enviar propuesta',
      description: 'Preparar y enviar propuesta comercial',
      status: 'completed',
      priority: 'medium',
      due_date: '2024-01-18',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckSquare className="h-4 w-4 text-green-600" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-orange-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default' as const;
      case 'overdue':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      default:
        return 'border-l-green-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Tareas del Lead</CardTitle>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Tarea
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No hay tareas asignadas para este lead.
              </p>
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} className={`border-l-4 ${getPriorityColor(task.priority)}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getStatusIcon(task.status)}
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{task.title}</h4>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Vence: {task.due_date}</span>
                        <Badge variant="outline" className="text-xs">
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(task.status)}>
                    {task.status === 'completed' ? 'Completada' : 
                     task.status === 'overdue' ? 'Vencida' : 'Pendiente'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
