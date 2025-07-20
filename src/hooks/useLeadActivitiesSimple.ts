import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: 'call' | 'meeting' | 'email' | 'task' | 'note' | 'stage_change';
  title: string;
  description?: string;
  activity_date: string;
  duration_minutes?: number;
  outcome?: 'completed' | 'no_answer' | 'busy' | 'rescheduled';
  next_action?: string;
  next_action_date?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  activity_data?: any;
  points_awarded?: number;
}

export interface CreateLeadActivityData {
  lead_id: string;
  activity_type: LeadActivity['activity_type'];
  title: string;
  description?: string;
  activity_date?: string;
  duration_minutes?: number;
  outcome?: string;
  next_action?: string;
  next_action_date?: string;
  activity_data?: any;
}

export const useLeadActivities = (leadId: string) => {
  const queryClient = useQueryClient();

  const {
    data: activities = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['lead_activities', leadId],
    queryFn: async () => {
      // For now, return empty array since the table might not be reflected in types yet
      return [] as LeadActivity[];
    },
    enabled: !!leadId,
  });

  const createMutation = useMutation({
    mutationFn: async (activityData: CreateLeadActivityData) => {
      // Placeholder - will be implemented once types are updated
      return {} as LeadActivity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead_activities', leadId] });
      toast.success('Actividad registrada exitosamente');
    },
    onError: (error) => {
      console.error('Error creating activity:', error);
      toast.error('Error al registrar la actividad');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<LeadActivity> }) => {
      // Placeholder - will be implemented once types are updated
      return {} as LeadActivity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead_activities', leadId] });
      toast.success('Actividad actualizada exitosamente');
    },
    onError: (error) => {
      console.error('Error updating activity:', error);
      toast.error('Error al actualizar la actividad');
    },
  });

  return {
    activities,
    isLoading,
    error,
    refetch,
    createActivity: createMutation.mutate,
    updateActivity: updateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
};