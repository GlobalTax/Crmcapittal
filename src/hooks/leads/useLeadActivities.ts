import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: string;
  title: string;
  description?: string;
  activity_date: string;
  duration_minutes?: number;
  outcome?: string;
  next_action?: string;
  next_action_date?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  activity_data?: Record<string, any>;
  points_awarded?: number;
}

export interface CreateActivityData {
  lead_id: string;
  activity_type: string;
  title: string;
  description?: string;
  activity_date?: string;
  duration_minutes?: number;
  outcome?: string;
  next_action?: string;
  next_action_date?: string;
  activity_data?: Record<string, any>;
}

export const useLeadActivities = (leadId: string) => {
  const queryClient = useQueryClient();

  const activitiesQuery = useQuery({
    queryKey: ['lead-activities', leadId],
    queryFn: async () => {
      if (!leadId) {
        console.warn('No lead ID provided for activities query');
        return [];
      }

      const { data, error } = await supabase
        .from('lead_activities')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching lead activities:', error);
        // Return empty array instead of throwing to prevent app crashes
        return [];
      }

      return data as LeadActivity[];
    },
    enabled: !!leadId,
  });

  const createActivityMutation = useMutation({
    mutationFn: async (activityData: CreateActivityData) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const insertData: any = {
        lead_id: activityData.lead_id,
        activity_type: activityData.activity_type,
        title: activityData.title,
        description: activityData.description,
        duration_minutes: activityData.duration_minutes,
        outcome: activityData.outcome,
        next_action: activityData.next_action,
        next_action_date: activityData.next_action_date,
        activity_data: activityData.activity_data,
        created_by: userData.user?.id,
      };

      const { data, error } = await supabase
        .from('lead_activities')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating activity:', error);
        throw new Error('Error al crear actividad');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-activities', leadId] });
      toast.success('Actividad creada exitosamente');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    activities: activitiesQuery.data || [],
    isLoading: activitiesQuery.isLoading,
    error: activitiesQuery.error,
    createActivity: createActivityMutation.mutate,
    isCreating: createActivityMutation.isPending,
  };
};