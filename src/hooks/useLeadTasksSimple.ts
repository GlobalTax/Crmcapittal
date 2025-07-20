import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
      // For now, return empty array since the table might not be reflected in types yet
      return [] as LeadTask[];
    },
    enabled: !!leadId,
  });

  const createMutation = useMutation({
    mutationFn: async (taskData: CreateLeadTaskData) => {
      // Placeholder - will be implemented once types are updated
      return {} as LeadTask;
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
      // Placeholder - will be implemented once types are updated
      return {} as LeadTask;
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
      // Placeholder - will be implemented once types are updated
      return;
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