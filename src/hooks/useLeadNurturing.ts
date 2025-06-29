
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LeadNurturing, LeadActivity, LeadStage, LeadSource } from '@/types/LeadNurturing';
import { toast } from 'sonner';

export const useLeadNurturing = (leadId?: string) => {
  const queryClient = useQueryClient();

  // Fetch lead nurturing data
  const {
    data: nurturingData,
    isLoading: isLoadingNurturing,
    error: nurturingError
  } = useQuery({
    queryKey: ['lead-nurturing', leadId],
    queryFn: async () => {
      if (!leadId) return null;
      
      const { data, error } = await supabase
        .from('lead_nurturing')
        .select('*')
        .eq('lead_id', leadId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching lead nurturing:', error);
        throw error;
      }

      return data as LeadNurturing | null;
    },
    enabled: !!leadId,
  });

  // Fetch lead activities
  const {
    data: activities = [],
    isLoading: isLoadingActivities
  } = useQuery({
    queryKey: ['lead-activities', leadId],
    queryFn: async () => {
      if (!leadId) return [];
      
      const { data, error } = await supabase
        .from('lead_activities')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching lead activities:', error);
        throw error;
      }

      return data as LeadActivity[];
    },
    enabled: !!leadId,
  });

  // Update lead stage
  const updateStageMutation = useMutation({
    mutationFn: async ({ leadId, stage }: { leadId: string; stage: LeadStage }) => {
      const { data, error } = await supabase
        .from('lead_nurturing')
        .upsert({
          lead_id: leadId,
          stage,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating lead stage:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-nurturing'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Etapa del lead actualizada exitosamente');
    },
    onError: (error) => {
      console.error('Error updating stage:', error);
      toast.error('Error al actualizar la etapa del lead');
    },
  });

  // Add lead activity
  const addActivityMutation = useMutation({
    mutationFn: async (activityData: Omit<LeadActivity, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('lead_activities')
        .insert([activityData])
        .select()
        .single();

      if (error) {
        console.error('Error adding lead activity:', error);
        throw error;
      }

      // Update lead score
      if (activityData.points_awarded > 0) {
        await updateLeadScore(activityData.lead_id, activityData.points_awarded);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-activities'] });
      queryClient.invalidateQueries({ queryKey: ['lead-nurturing'] });
      toast.success('Actividad registrada exitosamente');
    },
    onError: (error) => {
      console.error('Error adding activity:', error);
      toast.error('Error al registrar la actividad');
    },
  });

  // Update lead score
  const updateLeadScore = async (leadId: string, pointsToAdd: number) => {
    const { error } = await supabase.rpc('update_lead_score', {
      p_lead_id: leadId,
      p_points_to_add: pointsToAdd
    });

    if (error) {
      console.error('Error updating lead score:', error);
    }
  };

  return {
    nurturingData,
    activities,
    isLoadingNurturing,
    isLoadingActivities,
    nurturingError,
    updateStage: updateStageMutation.mutate,
    addActivity: addActivityMutation.mutate,
    isUpdatingStage: updateStageMutation.isPending,
    isAddingActivity: addActivityMutation.isPending,
  };
};

// Hook for lead scoring dashboard
export const useLeadScoring = () => {
  const {
    data: leadScores = [],
    isLoading
  } = useQuery({
    queryKey: ['lead-scores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          id,
          name,
          email,
          company_name,
          status,
          created_at,
          lead_nurturing(lead_score, engagement_score, stage, last_activity_date)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching lead scores:', error);
        throw error;
      }

      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return {
    leadScores,
    isLoading
  };
};
