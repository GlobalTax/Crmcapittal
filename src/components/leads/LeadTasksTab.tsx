import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Lead } from '@/types/Lead';
import { useLeadTasks } from '@/hooks/useLeadTasksSimple';
import { Plus, Calendar, User, Trash2, Edit, Save, X, CheckCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';

interface LeadTasksTabProps {
  lead: Lead;
}

export const LeadTasksTab = ({ lead }: LeadTasksTabProps) => {
  const { tasks, isLoading, createTask, updateTask, deleteTask, isCreating } = useLeadTasks(lead.id);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: '',
  });
  const [editTask, setEditTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: '',
  });

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;
    
    createTask({
      lead_id: lead.id,
      title: newTask.title,
      description: newTask.description || undefined,
      priority: newTask.priority,
      due_date: newTask.due_date || undefined,
    });
    
    setNewTask({ title: '', description: '', priority: 'medium', due_date: '' });
    setIsAddingTask(false);
  };

  const handleStartEdit = (taskId: string, task: any) => {
    setEditingTaskId(taskId);
    setEditTask({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      due_date: task.due_date ? format(new Date(task.due_date), 'yyyy-MM-dd') : '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingTaskId || !editTask.title.trim()) return;
    
    updateTask({
      id: editingTaskId,
      updates: {
        title: editTask.title,
        description: editTask.description || undefined,
        priority: editTask.priority,
        due_date: editTask.due_date || undefined,
      },
    });
    
    setEditingTaskId(null);
    setEditTask({ title: '', description: '', priority: 'medium', due_date: '' });
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditTask({ title: '', description: '', priority: 'medium', due_date: '' });
  };

  const handleToggleComplete = (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    updateTask({
      id: taskId,
      updates: { status: newStatus },
    });
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return priority;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const pendingTasks = tasks.filter(task => task.status !== 'completed');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Add Task Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Tareas del Lead</CardTitle>
            {!isAddingTask && (
              <Button 
                onClick={() => setIsAddingTask(true)}
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Nueva Tarea
              </Button>
            )}
          </div>
        </CardHeader>
        
        {isAddingTask && (
          <CardContent className="pt-0">
            <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Título de la tarea"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Textarea
                    placeholder="Descripción (opcional)"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    rows={2}
                  />
                </div>
                <div>
                  <Select value={newTask.priority} onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateTask}
                  disabled={isCreating || !newTask.title.trim()}
                  size="sm"
                >
                  {isCreating ? 'Creando...' : 'Crear Tarea'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddingTask(false);
                    setNewTask({ title: '', description: '', priority: 'medium', due_date: '' });
                  }}
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Tareas Pendientes</h3>
          {pendingTasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="p-4">
                {editingTaskId === task.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Input
                          value={editTask.title}
                          onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Textarea
                          value={editTask.description}
                          onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div>
                        <Select value={editTask.priority} onValueChange={(value: any) => setEditTask({ ...editTask, priority: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Baja</SelectItem>
                            <SelectItem value="medium">Media</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Input
                          type="date"
                          value={editTask.due_date}
                          onChange={(e) => setEditTask({ ...editTask, due_date: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdit} size="sm" className="gap-2">
                        <Save className="h-4 w-4" />
                        Guardar
                      </Button>
                      <Button variant="outline" onClick={handleCancelEdit} size="sm" className="gap-2">
                        <X className="h-4 w-4" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={task.status === 'completed'}
                        onCheckedChange={() => handleToggleComplete(task.id, task.status)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{task.title}</h4>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStartEdit(task.id, task)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTask(task.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant={getPriorityBadgeColor(task.priority)}>
                            {getPriorityLabel(task.priority)}
                          </Badge>
                          <Badge variant={getStatusBadgeColor(task.status)}>
                            {getStatusLabel(task.status)}
                          </Badge>
                          {task.due_date && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(task.due_date), 'dd/MM/yyyy')}
                            </div>
                          )}
                          <span className="text-muted-foreground">
                            {formatDistanceToNow(new Date(task.created_at), { 
                              addSuffix: true, 
                              locale: es 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Tareas Completadas</h3>
          {completedTasks.map((task) => (
            <Card key={task.id} className="opacity-75">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={true}
                    onCheckedChange={() => handleToggleComplete(task.id, task.status)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium line-through">{task.title}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTask(task.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-through">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="default">
                        Completada
                      </Badge>
                      {task.completed_at && (
                        <span className="text-muted-foreground">
                          Completada {formatDistanceToNow(new Date(task.completed_at), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {tasks.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              No hay tareas para este lead. Crea la primera tarea.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};