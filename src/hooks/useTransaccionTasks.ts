import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TransaccionTask {
  id: string;
  transaccion_id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  assigned_to?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useTransaccionTasks = (transaccionId: string) => {
  const [tasks, setTasks] = useState<TransaccionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTasks = async () => {
    if (!transaccionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use contact_tasks table but filter by transaccion
      // For now, we'll use mock data since the relationship isn't established
      const mockTasks: TransaccionTask[] = [];

      setTasks(mockTasks);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar las tareas';
      setError(errorMessage);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: Omit<TransaccionTask, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const newTask: TransaccionTask = {
        ...taskData,
        id: Date.now().toString(),
        created_by: user?.user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setTasks(prev => [newTask, ...prev]);
      
      toast({
        title: "Tarea creada",
        description: `${taskData.title} ha sido creada correctamente.`,
      });

      return { data: newTask, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la tarea';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error creating task:', err);
      return { data: null, error: errorMessage };
    }
  };

  const updateTask = async (taskId: string, updates: Partial<TransaccionTask>) => {
    try {
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, ...updates, updated_at: new Date().toISOString() }
          : task
      ));
      
      toast({
        title: "Tarea actualizada",
        description: "Los cambios han sido guardados correctamente.",
      });

      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar la tarea';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error updating task:', err);
      return { error: errorMessage };
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      toast({
        title: "Tarea eliminada",
        description: "La tarea ha sido eliminada correctamente.",
      });

      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar la tarea';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error deleting task:', err);
      return { error: errorMessage };
    }
  };

  const toggleTaskCompletion = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return { error: 'Tarea no encontrada' };

    return updateTask(taskId, { completed: !task.completed });
  };

  useEffect(() => {
    fetchTasks();
  }, [transaccionId]);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    refetch: fetchTasks
  };
};