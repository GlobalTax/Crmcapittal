import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LeadTask {
  id: string;
  lead_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: string;
  created_by?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadTaskData {
  lead_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority?: LeadTask['priority'];
  assigned_to?: string;
}

export const useLeadTasks = (leadId: string) => {
  const queryClient = useQueryClient();

  const {
    data: tasks = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['lead_tasks', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_tasks')
        .select('*')
        .eq('lead_id', leadId)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching lead tasks:', error);
        throw new Error('Error al cargar tareas del lead');
      }

      return data as LeadTask[];
    },
    enabled: !!leadId,
  });

  const createMutation = useMutation({
    mutationFn: async (taskData: CreateLeadTaskData) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('lead_tasks')
        .insert({
          lead_id: taskData.lead_id,
          title: taskData.title,
          description: taskData.description,
          due_date: taskData.due_date,
          priority: taskData.priority || 'medium',
          assigned_to: taskData.assigned_to,
          created_by: userData.user?.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating task:', error);
        throw new Error('Error al crear tarea');
      }

      return data as LeadTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead_tasks', leadId] });
      toast.success('Tarea creada exitosamente');
    },
    onError: (error) => {
      console.error('Error creating task:', error);
      toast.error('Error al crear la tarea');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<LeadTask> }) => {
      const { data, error } = await supabase
        .from('lead_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating task:', error);
        throw new Error('Error al actualizar tarea');
      }

      return data as LeadTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead_tasks', leadId] });
      toast.success('Tarea actualizada exitosamente');
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      toast.error('Error al actualizar la tarea');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lead_tasks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting task:', error);
        throw new Error('Error al eliminar tarea');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead_tasks', leadId] });
      toast.success('Tarea eliminada exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
      toast.error('Error al eliminar la tarea');
    },
  });

  return {
    tasks,
    isLoading,
    error,
    refetch,
    createTask: createMutation.mutate,
    updateTask: updateMutation.mutate,
    deleteTask: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};