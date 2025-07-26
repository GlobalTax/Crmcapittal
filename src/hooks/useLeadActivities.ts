import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type LeadActivity = Database['public']['Tables']['lead_activities']['Row'];
type CreateLeadActivityData = Database['public']['Tables']['lead_activities']['Insert'];

export const useLeadActivities = (leadId: string) => {
  const queryClient = useQueryClient();

  const {
    data: activities = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['lead_activities_fixed', leadId], // New cache key to avoid conflicts
    queryFn: async () => {
      console.log('🔍 Fetching lead activities for:', leadId);
      
      const { data, error } = await supabase
        .from('lead_activities')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false }); // Fixed: use created_at instead of activity_date

      if (error) {
        console.error('❌ Error fetching lead activities:', error);
        throw error;
      }

      console.log('✅ Successfully fetched lead activities:', data?.length || 0);
      return data || [];
    },
    enabled: !!leadId,
  });

  const createMutation = useMutation({
    mutationFn: async (activityData: CreateLeadActivityData) => {
      console.log('Creating lead activity:', activityData);
      
      const { data, error } = await supabase
        .from('lead_activities')
        .insert([activityData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead_activities_fixed', leadId] });
      toast.success('Actividad registrada exitosamente');
    },
    onError: (error) => {
      console.error('Error creating activity:', error);
      toast.error('Error al registrar la actividad');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateLeadActivityData> }) => {
      const { data, error } = await supabase
        .from('lead_activities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead_activities_fixed', leadId] });
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
    refetch: () => queryClient.invalidateQueries({ queryKey: ['lead_activities_fixed', leadId] }),
    createActivity: createMutation.mutate,
    updateActivity: updateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
};