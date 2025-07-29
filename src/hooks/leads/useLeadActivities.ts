import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type LeadActivity = Database['public']['Tables']['lead_activities']['Row'];
type CreateActivityData = Database['public']['Tables']['lead_activities']['Insert'];

export function useLeadActivities(leadId: string) {
  const queryClient = useQueryClient();

  // Fetch lead activities
  const activitiesQuery = useQuery({
    queryKey: ['lead_activities', leadId],
    queryFn: async () => {
      if (!leadId) return [];
      
      const { data, error } = await supabase
        .from('lead_activities')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LeadActivity[];
    },
    enabled: !!leadId,
  });

  // Create lead activity
  const createActivityMutation = useMutation({
    mutationFn: async (activityData: Omit<CreateActivityData, 'created_by'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('lead_activities')
        .insert({
          ...activityData,
          created_by: user.id,
          points_awarded: activityData.points_awarded || 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead_activities', leadId] });
      toast.success('Actividad añadida exitosamente');
    },
    onError: (error) => {
      console.error('Error creating activity:', error);
      toast.error('Error al crear la actividad');
    },
  });

  return {
    activities: activitiesQuery.data || [],
    isLoading: activitiesQuery.isLoading,
    error: activitiesQuery.error,
    createActivity: createActivityMutation.mutate,
    isCreating: createActivityMutation.isPending,
  };
}