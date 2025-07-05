import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState } from '@/components/ui/EmptyState';
import { Task, usePersonalTasks } from '@/hooks/usePersonalTasks';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Star,
  User,
  Phone,
  Mail,
  FileText 
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface PersonalTasksListProps {
  contactId?: string;
  showCreateForm?: boolean;
}

export const PersonalTasksList = ({ contactId, showCreateForm = false }: PersonalTasksListProps) => {
  const { tasks, loading, completeTask, deleteTask } = usePersonalTasks();
  const { toast } = useToast();

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'high':
        return <Star className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lead':
        return <User className="h-4 w-4" />;
      case 'meeting':
        return <Calendar className="h-4 w-4" />;
      case 'follow-up':
        return <Phone className="h-4 w-4" />;
      case 'admin':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      urgent: 'destructive' as const,
      high: 'secondary' as const,
      medium: 'outline' as const,
      low: 'outline' as const
    };
    
    const labels = {
      urgent: 'Urgente',
      high: 'Alta',
      medium: 'Media',
      low: 'Baja'
    };

    return (
      <Badge variant={variants[priority as keyof typeof variants] || 'outline'}>
        {labels[priority as keyof typeof labels] || priority}
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    const labels = {
      lead: 'Lead',
      meeting: 'Reunión',
      'follow-up': 'Seguimiento',
      admin: 'Admin'
    };

    return (
      <Badge variant="outline">
        {labels[category as keyof typeof labels] || category}
      </Badge>
    );
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      await completeTask(task.id);
      toast({
        title: task.completed ? "Tarea marcada como pendiente" : "Tarea completada",
        description: `"${task.title}" ha sido actualizada.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la tarea.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (task: Task) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la tarea "${task.title}"?`)) {
      return;
    }

    try {
      await deleteTask(task.id);
      toast({
        title: "Tarea eliminada",
        description: `"${task.title}" ha sido eliminada.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la tarea.",
        variant: "destructive",
      });
    }
  };

  const isOverdue = (task: Task) => {
    if (task.completed) return false;
    return new Date(task.due_date) < new Date();
  };

  const filteredTasks = contactId
    ? tasks.filter(task => task.description?.includes(contactId) || task.title.includes(contactId))
    : tasks;

  const pendingTasks = filteredTasks.filter(task => !task.completed);
  const completedTasks = filteredTasks.filter(task => task.completed);

  if (loading) {
    return <div className="flex items-center justify-center p-8">Cargando tareas...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Tareas Pendientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Tareas Pendientes ({pendingTasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingTasks.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No hay tareas pendientes"
              subtitle="¡Perfecto! No tienes tareas por completar"
            />
          ) : (
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                    isOverdue(task) ? 'border-destructive/20 bg-destructive/5' : 'border-border'
                  }`}
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleToggleComplete(task)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-1">
                        {getPriorityIcon(task.priority)}
                        {isOverdue(task) && (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      {getPriorityBadge(task.priority)}
                      {getCategoryBadge(task.category)}
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(new Date(task.due_date), 'dd/MM/yyyy', { locale: es })}
                        </span>
                      </div>
                      
                      {isOverdue(task) && (
                        <Badge variant="destructive" className="text-xs">
                          Vencida
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTask(task)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tareas Completadas */}
      {completedTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Tareas Completadas ({completedTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/30">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleToggleComplete(task)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-medium line-through text-muted-foreground">
                      {task.title}
                    </h4>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      {getCategoryBadge(task.category)}
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Completada</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTask(task)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    ×
                  </Button>
                </div>
              ))}
              
              {completedTasks.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  y {completedTasks.length - 5} tareas completadas más...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};