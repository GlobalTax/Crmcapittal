import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedPolling } from './useOptimizedPolling';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string;
  completed: boolean;
  category: 'lead' | 'meeting' | 'follow-up' | 'admin';
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export const usePersonalTasks = () => {
  const { user } = useAuth();
  
  // Use optimized polling with longer intervals for personal tasks
  const {
    data: rawTasks,
    loading,
    error: pollingError,
    refetch
  } = useOptimizedPolling({
    queryKey: `user_tasks_${user?.id}`,
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    interval: 300000, // 5 minutes for personal tasks
    priority: 'low', // Personal tasks have lower priority
    cacheTtl: 240000, // 4 minutes cache
    enabled: !!user
  });

  // Transform tasks
  const tasks = (rawTasks || []).map(task => ({
    ...task,
    priority: task.priority as 'low' | 'medium' | 'high' | 'urgent',
    category: task.category as 'lead' | 'meeting' | 'follow-up' | 'admin',
    tags: task.tags || []
  }));

  const error = pollingError?.message || null;

  // Manual refresh function that clears cache
  const loadTasks = () => {
    refetch();
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
      
      loadTasks(); // Refresh tasks after creation
      return data;
    } catch (err) {
      console.error('Error al crear tarea:', err);
      throw err;
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
      
      loadTasks(); // Refresh tasks after update
      return data;
    } catch (err) {
      console.error('Error al actualizar tarea:', err);
      throw err;
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
      
      loadTasks(); // Refresh tasks after deletion
      return true;
    } catch (err) {
      console.error('Error al eliminar tarea:', err);
      throw err;
    }
  };

  // Actualizar tags de una tarea
  const updateTags = async (taskId: string, tags: string[]) => {
    return updateTask(taskId, { tags });
  };

  // Obtener tareas filtradas
  const getTodayTasks = () => tasks.filter(task => !task.completed);
  const getCompletedTasks = () => tasks.filter(task => task.completed);
  const getUrgentTasks = () => tasks.filter(task => !task.completed && task.priority === 'urgent');
  const getTasksByTag = (tag: string) => tasks.filter(task => task.tags?.includes(tag));
  const getAllTags = () => {
    const tagSet = new Set<string>();
    tasks.forEach(task => task.tags?.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  };

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    completeTask,
    deleteTask,
    loadTasks,
    updateTags,
    getTodayTasks,
    getCompletedTasks,
    getUrgentTasks,
    getTasksByTag,
    getAllTags,
  };
};