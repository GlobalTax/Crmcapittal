
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MandateTask {
  id: string;
  mandate_id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: string;
  due_date?: string;
  assigned_to?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useMandateTasks = (mandateId: string) => {
  const [tasks, setTasks] = useState<MandateTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTasks = async () => {
    if (!mandateId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('mandate_tasks')
        .select('*')
        .eq('mandate_id', mandateId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setTasks(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar las tareas';
      setError(errorMessage);
      console.error('Error fetching mandate tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: Omit<MandateTask, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user?.user?.id) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('mandate_tasks')
        .insert({
          ...taskData,
          created_by: user.user.id
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setTasks(prev => [data, ...prev]);
      
      toast({
        title: "Tarea creada",
        description: `${taskData.title} ha sido creada correctamente.`,
      });

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la tarea';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error creating mandate task:', err);
      return { data: null, error: errorMessage };
    }
  };

  const updateTask = async (taskId: string, updates: Partial<MandateTask>) => {
    try {
      const { error } = await supabase
        .from('mandate_tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) {
        throw error;
      }

      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, ...updates }
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
      console.error('Error updating mandate task:', err);
      return { error: errorMessage };
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('mandate_tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        throw error;
      }

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
      console.error('Error deleting mandate task:', err);
      return { error: errorMessage };
    }
  };

  const toggleTaskCompletion = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return { error: 'Tarea no encontrada' };

    return updateTask(taskId, { completed: !task.completed });
  };

  const seedExampleTasks = async () => {
    if (tasks.length > 0) return; // Ya hay tareas

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const exampleTasks = [
      {
        mandate_id: mandateId,
        title: "Revisar documentación legal del cliente",
        description: "Analizar los términos del mandato y requisitos específicos del cliente",
        completed: false,
        priority: "high",
        due_date: tomorrow.toISOString().split('T')[0]
      },
      {
        mandate_id: mandateId,
        title: "Identificar empresas objetivo sector tecnológico",
        description: "Buscar empresas que cumplan criterios de facturación 2-5M€",
        completed: true,
        priority: "medium"
      },
      {
        mandate_id: mandateId,
        title: "Preparar perfiles de empresas candidatas",
        description: "Crear presentaciones con información detallada de 3 empresas identificadas",
        completed: false,
        priority: "medium",
        due_date: nextWeek.toISOString().split('T')[0]
      },
      {
        mandate_id: mandateId,
        title: "Agendar reunión de seguimiento con cliente",
        description: "Coordinar próxima reunión para presentar candidatos",
        completed: false,
        priority: "low"
      }
    ];

    for (const taskData of exampleTasks) {
      await createTask(taskData);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [mandateId]);

  // Crear tareas de ejemplo si no hay datos
  useEffect(() => {
    if (!loading && tasks.length === 0 && mandateId) {
      seedExampleTasks();
    }
  }, [loading, tasks.length, mandateId]);

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
