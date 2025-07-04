import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string;
  completed: boolean;
  category: 'lead' | 'meeting' | 'follow-up' | 'admin';
  created_at: string;
  updated_at: string;
}

export const usePersonalTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar tareas del usuario
  const loadTasks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks((data || []).map(task => ({
        ...task,
        priority: task.priority as 'low' | 'medium' | 'high' | 'urgent',
        category: task.category as 'lead' | 'meeting' | 'follow-up' | 'admin'
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar tareas');
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva tarea
  const createTask = async (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const newTask = {
        ...taskData,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('user_tasks')
        .insert([newTask])
        .select()
        .single();

      if (error) throw error;
      
      const typedData = {
        ...data,
        priority: data.priority as 'low' | 'medium' | 'high' | 'urgent',
        category: data.category as 'lead' | 'meeting' | 'follow-up' | 'admin'
      };
      
      setTasks(prev => [typedData, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear tarea');
      return null;
    }
  };

  // Actualizar tarea
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('user_tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      
      const typedData = {
        ...data,
        priority: data.priority as 'low' | 'medium' | 'high' | 'urgent',
        category: data.category as 'lead' | 'meeting' | 'follow-up' | 'admin'
      };
      
      setTasks(prev => prev.map(task => task.id === taskId ? typedData : task));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar tarea');
      return null;
    }
  };

  // Completar tarea
  const completeTask = async (taskId: string) => {
    return updateTask(taskId, { completed: true });
  };

  // Eliminar tarea
  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('user_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      
      setTasks(prev => prev.filter(task => task.id !== taskId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar tarea');
      return false;
    }
  };

  // Cargar tareas al montar el componente
  useEffect(() => {
    loadTasks();
  }, [user]);

  // Obtener tareas filtradas
  const getTodayTasks = () => tasks.filter(task => !task.completed);
  const getCompletedTasks = () => tasks.filter(task => task.completed);
  const getUrgentTasks = () => tasks.filter(task => !task.completed && task.priority === 'urgent');

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    completeTask,
    deleteTask,
    loadTasks,
    getTodayTasks,
    getCompletedTasks,
    getUrgentTasks,
  };
};