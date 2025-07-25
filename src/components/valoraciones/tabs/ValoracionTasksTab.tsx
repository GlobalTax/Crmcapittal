import React, { useState, useEffect } from 'react';
import { Valoracion } from '@/types/Valoracion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, User, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ValoracionTask {
  id: string;
  valoracion_id: string;
  title: string;
  description: string | null;
  priority: string;
  assigned_to: string | null;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  assigned_user?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

interface ValoracionTasksTabProps {
  valoracion: Valoracion;
}

export const ValoracionTasksTab: React.FC<ValoracionTasksTabProps> = ({ valoracion }) => {
  const [tasks, setTasks] = useState<ValoracionTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [valoracion.id]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('valoracion_tasks')
        .select(`
          *,
          assigned_user:user_profiles(first_name, last_name)
        `)
        .eq('valoracion_id', valoracion.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks((data as any) || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('valoracion_tasks')
        .update({
          completed: completed,
          completed_at: completed ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getStatusColor = (completed: boolean) => {
    return completed ? 'default' : 'outline';
  };

  const getStatusText = (completed: boolean) => {
    return completed ? 'Completada' : 'Pendiente';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'secondary';
      case 'medium':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Urgente';
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      default:
        return 'Baja';
    }
  };

  const tasksByStatus = {
    pending: tasks.filter(task => !task.completed),
    completed: tasks.filter(task => task.completed)
  };

  if (loading) {
    return <div className="p-4">Cargando tareas...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Tareas de Valoración</h3>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Tarea
        </Button>
      </div>

      {/* Mini Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pending Column */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              Pendientes ({tasksByStatus.pending.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasksByStatus.pending.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay tareas pendientes
              </p>
            ) : (
              tasksByStatus.pending.map((task) => (
                <Card key={task.id} className="p-3 hover:shadow-sm transition-shadow cursor-pointer">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                        {getPriorityText(task.priority)}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      {task.assigned_user && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>
                            {task.assigned_user.first_name} {task.assigned_user.last_name}
                          </span>
                        </div>
                      )}
                      
                      {task.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(new Date(task.due_date), 'dd/MM', { locale: es })}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => updateTaskStatus(task.id, true)}
                    >
                      Completar
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Completed Column */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              Completadas ({tasksByStatus.completed.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasksByStatus.completed.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay tareas completadas
              </p>
            ) : (
              tasksByStatus.completed.map((task) => (
                <Card key={task.id} className="p-3 opacity-75">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm line-through">{task.title}</h4>
                      <Badge variant="default" className="text-xs">
                        Completada
                      </Badge>
                    </div>
                    
                    {task.completed_at && (
                      <p className="text-xs text-muted-foreground">
                        Completada el {format(new Date(task.completed_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </p>
                    )}
                    
                    {task.assigned_user && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>
                          {task.assigned_user.first_name} {task.assigned_user.last_name}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};