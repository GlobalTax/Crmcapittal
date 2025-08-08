import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Helper function to track analytics events
const trackStageChange = (leadId: string, oldStageId: string | null, newStageId: string, newProbability: number) => {
  // Track analytics event (can be enhanced with PostHog/analytics provider)
  console.log('Analytics: stage_changed', {
    lead_id: leadId,
    old_stage_id: oldStageId,
    new_stage_id: newStageId,
    new_probability: newProbability,
    timestamp: new Date().toISOString()
  });
  
  // Here you could send to PostHog, Mixpanel, etc.
  // posthog.capture('stage_changed', { ... });
};

export interface UpdateLeadStageData {
  leadId: string;
  stageId: string;
  stageName: string;
  lost_reason?: string;
}

export interface MarkLeadWonData {
  leadId: string;
  wonDate?: string;
  dealValue?: number;
}

export interface MarkLeadLostData {
  leadId: string;
  lostDate?: string;
  lostReason: string; // Required for lost leads
}

export const useUpdateLead = () => {
  const queryClient = useQueryClient();

  const updateStageMutation = useMutation({
    mutationFn: async ({ leadId, stageId, lost_reason }: UpdateLeadStageData) => {
      // Get current lead to track analytics
      const { data: currentLead } = await supabase
        .from('leads')
        .select('pipeline_stage_id, probability')
        .eq('id', leadId)
        .maybeSingle();

      const updateData: any = {
        pipeline_stage_id: stageId,
        updated_at: new Date().toISOString(),
      };

      // Agregar lost_reason si se proporciona
      if (lost_reason) {
        updateData.lost_reason = lost_reason;
      }

      const { data, error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', leadId)
        .select('*, probability')
        .maybeSingle();

      if (error) {
        console.error('Error updating lead stage:', error);
        throw new Error(error.message || 'Error al cambiar etapa del lead');
      }

      // Track analytics for stage change
      if (data && currentLead) {
        trackStageChange(
          leadId,
          currentLead.pipeline_stage_id,
          stageId,
          data.probability || 0
        );
      }

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.leadId] });
      toast.success(`Lead movido a: ${variables.stageName}`);
    },
    onError: (error, variables) => {
      const retryAction = () => updateStageMutation.mutate(variables);
      toast.error(error.message, {
        action: {
          label: 'Reintentar',
          onClick: retryAction,
        },
      });
    },
  });

  const markWonMutation = useMutation({
    mutationFn: async ({ leadId, wonDate, dealValue }: MarkLeadWonData) => {
      // Find the "Ganado" stage
      const { data: stages } = await supabase
        .from('pipeline_stages')
        .select('id')
        .eq('name', 'Ganado')
        .single();

      if (!stages) {
        throw new Error('No se encontró la etapa "Ganado"');
      }

      const { data, error } = await supabase
        .from('leads')
        .update({
          pipeline_stage_id: stages.id,
          won_date: wonDate || new Date().toISOString(),
          deal_value: dealValue,
          status: 'QUALIFIED',
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadId)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error marking lead as won:', error);
        throw new Error('Error al marcar lead como ganado');
      }

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.leadId] });
      toast.success('Lead marcado como Ganado 🎉');
    },
    onError: (error, variables) => {
      const retryAction = () => markWonMutation.mutate(variables);
      toast.error(error.message, {
        action: {
          label: 'Reintentar',
          onClick: retryAction,
        },
      });
    },
  });

  const markLostMutation = useMutation({
    mutationFn: async ({ leadId, lostDate, lostReason }: MarkLeadLostData) => {
      // Find the "Perdido" stage
      const { data: stages } = await supabase
        .from('pipeline_stages')
        .select('id')
        .eq('name', 'Perdido')
        .single();

      if (!stages) {
        throw new Error('No se encontró la etapa "Perdido"');
      }

      const { data, error } = await supabase
        .from('leads')
        .update({
          pipeline_stage_id: stages.id,
          lost_date: lostDate || new Date().toISOString(),
          lost_reason: lostReason,
          status: 'DISQUALIFIED',
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadId)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error marking lead as lost:', error);
        throw new Error('Error al marcar lead como perdido');
      }

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.leadId] });
      toast.success('Lead marcado como Perdido');
    },
    onError: (error, variables) => {
      const retryAction = () => markLostMutation.mutate(variables);
      toast.error(error.message, {
        action: {
          label: 'Reintentar',
          onClick: retryAction,
        },
      });
    },
  });

  return {
    updateStage: updateStageMutation.mutate,
    markWon: markWonMutation.mutate,
    markLost: markLostMutation.mutate,
    isUpdating: updateStageMutation.isPending || markWonMutation.isPending || markLostMutation.isPending,
  };
};