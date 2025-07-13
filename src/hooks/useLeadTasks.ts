import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LeadTask {
  id: string;
  lead_id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date: string | null;
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface CreateLeadTaskData {
  lead_id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  assigned_to?: string;
}

export interface UpdateLeadTaskData {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date?: string;
  assigned_to?: string;
  completed_at?: string;
}

export const useLeadTasks = (leadId: string) => {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, error, refetch } = useQuery({
    queryKey: ['lead-tasks', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_tasks')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LeadTask[];
    },
    enabled: !!leadId,
  });

  const createTask = useMutation({
    mutationFn: async (taskData: CreateLeadTaskData) => {
      const { data, error } = await supabase
        .from('lead_tasks')
        .insert([{ ...taskData, created_by: (await supabase.auth.getUser()).data.user?.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-tasks', leadId] });
      toast.success('Tarea creada exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error al crear la tarea: ${error.message}`);
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateLeadTaskData }) => {
      // Si se está marcando como completada, agregar completed_at
      if (updates.status === 'completed' && !updates.completed_at) {
        updates.completed_at = new Date().toISOString();
      } else if (updates.status !== 'completed') {
        updates.completed_at = null;
      }

      const { data, error } = await supabase
        .from('lead_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-tasks', leadId] });
      toast.success('Tarea actualizada exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error al actualizar la tarea: ${error.message}`);
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('lead_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-tasks', leadId] });
      toast.success('Tarea eliminada exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error al eliminar la tarea: ${error.message}`);
    },
  });

  const completeTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { data, error } = await supabase
        .from('lead_tasks')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-tasks', leadId] });
      toast.success('Tarea completada');
    },
    onError: (error: any) => {
      toast.error(`Error al completar la tarea: ${error.message}`);
    },
  });

  return {
    tasks,
    isLoading,
    error,
    refetch,
    createTask: createTask.mutate,
    updateTask: updateTask.mutate,
    deleteTask: deleteTask.mutate,
    completeTask: completeTask.mutate,
    isCreating: createTask.isPending,
    isUpdating: updateTask.isPending,
    isDeleting: deleteTask.isPending,
    isCompleting: completeTask.isPending,
  };
};