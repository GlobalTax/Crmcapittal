import { useState } from 'react';
import { useContactTasks, ContactTask } from '@/hooks/useContactTasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Star, 
  Trash2 
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ContactTasksTabProps {
  contactId: string;
  currentUserId: string;
}

export function ContactTasksTab({ contactId, currentUserId }: ContactTasksTabProps) {
  const { tasks, loading, createTask, updateTask, deleteTask } = useContactTasks(contactId);
  const { toast } = useToast();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    due_date: '',
  });

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

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;
    
    try {
      await createTask({
        contact_id: contactId,
        title: newTask.title,
        description: newTask.description || undefined,
        priority: newTask.priority,
        due_date: newTask.due_date || undefined,
        completed: false,
        created_by: currentUserId,
        assigned_to: currentUserId,
      });
      
      setNewTask({ title: '', description: '', priority: 'medium', due_date: '' });
      setShowCreateForm(false);
      
      toast({
        title: "Tarea creada",
        description: "La tarea ha sido creada correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la tarea.",
        variant: "destructive",
      });
    }
  };

  const handleToggleComplete = async (task: ContactTask) => {
    try {
      await updateTask(task.id, { completed: !task.completed });
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

  const handleDeleteTask = async (task: ContactTask) => {
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

  const isOverdue = (task: ContactTask) => {
    if (task.completed || !task.due_date) return false;
    return new Date(task.due_date) < new Date();
  };

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  if (loading) {
    return <div className="flex items-center justify-center p-8">Cargando tareas...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Botón para crear nueva tarea */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tareas del Contacto</h3>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Tarea
        </Button>
      </div>

      {/* Formulario de creación */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Crear Nueva Tarea</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Título de la tarea"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <Textarea
              placeholder="Descripción (opcional)"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              rows={3}
            />
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium">Prioridad</label>
                <Select value={newTask.priority} onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium">Fecha límite</label>
                <Input
                  type="datetime-local"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateTask}>Crear Tarea</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
            <p className="text-muted-foreground text-center py-4">
              No hay tareas pendientes
            </p>
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
                      <h4 className="font-medium">{task.title}</h4>
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
                      
                      {task.due_date && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(new Date(task.due_date), 'dd/MM/yyyy HH:mm', { locale: es })}
                          </span>
                        </div>
                      )}
                      
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
                    <Trash2 className="h-4 w-4" />
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
              <Star className="h-5 w-5 text-green-600" />
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
                      {getPriorityBadge(task.priority)}
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3" />
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
                    <Trash2 className="h-4 w-4" />
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
}