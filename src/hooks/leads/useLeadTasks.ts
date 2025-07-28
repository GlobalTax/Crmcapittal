import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LeadTask {
  id: string;
  lead_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  completed_at?: string;
  assigned_to?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadTaskData {
  lead_id: string;
  title: string;
  description?: string;
  priority?: LeadTask['priority'];
  due_date?: string;
  assigned_to?: string;
}

export interface UpdateLeadTaskData {
  status?: LeadTask['status'];
  title?: string;
  description?: string;
  priority?: LeadTask['priority'];
  due_date?: string;
  completed_at?: string;
}

export const useLeadTasks = (leadId?: string) => {
  const queryClient = useQueryClient();

  const {
    data: tasks = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['lead-tasks', leadId],
    queryFn: async () => {
      let query = supabase
        .from('lead_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (leadId) {
        query = query.eq('lead_id', leadId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching lead tasks:', error);
        throw new Error('Error al cargar tareas del lead');
      }

      return data as LeadTask[];
    },
    enabled: !!leadId,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: CreateLeadTaskData) => {
      const { data, error } = await supabase
        .from('lead_tasks')
        .insert({
          ...taskData,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating lead task:', error);
        throw new Error('Error al crear tarea');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-tasks'] });
      toast.success('Tarea creada exitosamente');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateLeadTaskData }) => {
      const { data, error } = await supabase
        .from('lead_tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating lead task:', error);
        throw new Error('Error al actualizar tarea');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-tasks'] });
      toast.success('Tarea actualizada exitosamente');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lead_tasks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting lead task:', error);
        throw new Error('Error al eliminar tarea');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-tasks'] });
      toast.success('Tarea eliminada exitosamente');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('lead_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error completing task:', error);
        throw new Error('Error al completar tarea');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-tasks'] });
      toast.success('Tarea completada 🎉');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    tasks,
    isLoading,
    error,
    refetch,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    completeTask: completeTaskMutation.mutate,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
    isCompleting: completeTaskMutation.isPending,
  };
};