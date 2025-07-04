import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ContactTask {
  id: string;
  contact_id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  completed: boolean;
  created_by: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export function useContactTasks(contactId?: string) {
  const [tasks, setTasks] = useState<ContactTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!contactId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('contact_tasks')
        .select('*')
        .eq('contact_id', contactId)
        .order('due_date', { ascending: true });
        
      if (error) throw error;
      setTasks((data || []) as ContactTask[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Crear tarea
  const createTask = async (task: Omit<ContactTask, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('contact_tasks')
        .insert([task])
        .select()
        .single();
        
      if (error) throw error;
      setTasks((prev) => [data as ContactTask, ...prev]);
      return data as ContactTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear tarea');
      throw err;
    }
  };

  // Actualizar tarea
  const updateTask = async (id: string, updates: Partial<ContactTask>) => {
    try {
      const { data, error } = await supabase
        .from('contact_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      setTasks((prev) => prev.map((t) => (t.id === id ? data as ContactTask : t)));
      return data as ContactTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar tarea');
      throw err;
    }
  };

  // Eliminar tarea
  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_tasks')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      setTasks((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar tarea');
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}