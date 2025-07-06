import React, { useState } from 'react';
import { Transaccion } from '@/types/Transaccion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckSquare, Calendar, AlertCircle } from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTransaccionTasks } from '@/hooks/useTransaccionTasks';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  created_at: string;
}

interface TransaccionTasksTabProps {
  transaccion: Transaccion;
}

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600'
};

export const TransaccionTasksTab = ({ transaccion }: TransaccionTasksTabProps) => {
  const { tasks, loading, createTask, toggleTaskCompletion } = useTransaccionTasks(transaccion.id);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    await createTask({
      transaccion_id: transaccion.id,
      title: newTaskTitle.trim(),
      completed: false,
      priority: 'medium'
    });
    
    setNewTaskTitle('');
    setIsAdding(false);
  };

  const handleToggleTask = async (taskId: string) => {
    await toggleTaskCompletion(taskId);
  };

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  const isOverdue = (task: any) => {
    if (!task.due_date || task.completed) return false;
    return isBefore(new Date(task.due_date), new Date());
  };

  return (
    <div className="space-y-4">
      {/* Add Task Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Tareas</h3>
          {!isAdding && (
            <Button size="sm" variant="outline" onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Agregar Tarea
            </Button>
          )}
        </div>
        
        {isAdding && (
          <div className="flex gap-2">
            <Input
              placeholder="Ingresa el título de la tarea..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddTask();
                } else if (e.key === 'Escape') {
                  setIsAdding(false);
                  setNewTaskTitle('');
                }
              }}
              autoFocus
            />
            <Button size="sm" onClick={handleAddTask} disabled={!newTaskTitle.trim()}>
              Agregar
            </Button>
            <Button size="sm" variant="outline" onClick={() => {
              setIsAdding(false);
              setNewTaskTitle('');
            }}>
              Cancelar
            </Button>
          </div>
        )}
      </div>

      {/* Tasks List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Cargando tareas...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aún no hay tareas</p>
              <p className="text-xs">Crea tareas para hacer seguimiento del progreso</p>
            </div>
          ) : (
            <>
              {/* Pending Tasks */}
              {pendingTasks.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground">
                    Pendientes ({pendingTasks.length})
                  </h4>
                  {pendingTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        isOverdue(task) ? 'border-red-200 bg-red-50' : 'border-border bg-neutral-0'
                      }`}
                    >
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => handleToggleTask(task.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {task.title}
                            </p>
                            {task.due_date && (
                              <div className="flex items-center gap-1 mt-1">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span className={`text-xs ${
                                  isOverdue(task) ? 'text-red-600' : 'text-muted-foreground'
                                }`}>
                                  Vence {format(new Date(task.due_date), 'PPP', { locale: es })}
                                  {isOverdue(task) && (
                                    <>
                                      <AlertCircle className="h-3 w-3 ml-1 text-red-600" />
                                      <span className="text-red-600"> (Vencida)</span>
                                    </>
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${PRIORITY_COLORS[task.priority]}`}
                          >
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Completed Tasks */}
              {completedTasks.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Completadas ({completedTasks.length})
                  </h4>
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/30"
                    >
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => handleToggleTask(task.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground line-through">
                          {task.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};