import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LeadTask {
  id: string;
  lead_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: string;
  status: string;
  assigned_to?: string;
  created_by?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskData {
  lead_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority?: string;
  assigned_to?: string;
}

export interface UpdateTaskData {
  status?: string;
  completed_at?: string;
}

export const useLeadTasks = (leadId: string) => {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: ['lead-tasks', leadId],
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

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: CreateTaskData) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('lead_tasks')
        .insert({
          ...taskData,
          created_by: userData.user?.id,
          priority: taskData.priority || 'medium',
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating task:', error);
        throw new Error('Error al crear tarea');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-tasks', leadId] });
      toast.success('Tarea creada exitosamente');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: UpdateTaskData }) => {
      const { data, error } = await supabase
        .from('lead_tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        console.error('Error updating task:', error);
        throw new Error('Error al actualizar tarea');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-tasks', leadId] });
      toast.success('Tarea actualizada exitosamente');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    error: tasksQuery.error,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
  };
};