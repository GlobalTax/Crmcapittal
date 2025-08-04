import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/Lead';
import { PipelineStage } from '@/hooks/leads/usePipelineStages';
import { useToast } from '@/hooks/use-toast';

export interface LeadWithStage extends Lead {
  stage_info?: PipelineStage;
}

export const useLeadKanban = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  // Fetch leads with pipeline stage information
  const { data: leads = [], isLoading, error, refetch } = useQuery({
    queryKey: ['leads-kanban'],
    queryFn: async () => {
      console.log('Fetching leads for Kanban...');
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .neq('status', 'DISQUALIFIED')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leads:', error);
        throw new Error('Error al cargar leads');
      }

      return (data || []) as unknown as LeadWithStage[];
    },
  });

  // Fetch pipeline stages
  const { data: stages = [] } = useQuery({
    queryKey: ['pipeline-stages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('is_active', true)
        .order('stage_order');

      if (error) {
        console.error('Error fetching pipeline stages:', error);
        throw new Error('Error al cargar etapas del pipeline');
      }

      return data as PipelineStage[];
    },
  });

  // Group leads by stage
  const leadsByStage = useMemo(() => {
    const groups: Record<string, LeadWithStage[]> = {};
    
    // Initialize all stages with empty arrays
    stages.forEach(stage => {
      groups[stage.id] = [];
    });

    // Group leads by pipeline_stage_id, including those without stages
    leads.forEach(lead => {
      const stageId = lead.pipeline_stage_id || 'no-stage';
      
      if (!groups[stageId]) {
        groups[stageId] = [];
      }
      
      // Add stage info to lead
      const stageInfo = stages.find(s => s.id === lead.pipeline_stage_id);
      const leadWithStage: LeadWithStage = {
        ...lead,
        stage_info: stageInfo
      };
      
      groups[stageId].push(leadWithStage);
    });

    return groups;
  }, [leads, stages]);

  // Mutation to update lead stage
  const updateLeadStage = useMutation({
    mutationFn: async ({ leadId, newStageId }: { leadId: string; newStageId: string }) => {
      const { error } = await supabase
        .from('leads')
        .update({ 
          pipeline_stage_id: newStageId,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId);

      if (error) {
        console.error('Error updating lead stage:', error);
        throw new Error('Error al actualizar etapa del lead');
      }

      return { leadId, newStageId };
    },
    onSuccess: (data) => {
      // Invalidate and refetch leads
      queryClient.invalidateQueries({ queryKey: ['leads-kanban'] });
      
      const stageName = stages.find(s => s.id === data.newStageId)?.name || 'Nueva etapa';
      toast({
        title: "Etapa actualizada",
        description: `Lead movido a "${stageName}" exitosamente`,
      });
      
      setDragError(null);
    },
    onError: (error) => {
      console.error('Failed to update lead stage:', error);
      setDragError(error.message);
      toast({
        title: "Error",
        description: "No se pudo actualizar la etapa del lead",
        variant: "destructive",
      });
    },
  });

  return {
    leads,
    stages,
    leadsByStage,
    isLoading,
    error,
    refetch,
    updateLeadStage: updateLeadStage.mutate,
    isUpdating: updateLeadStage.isPending,
    isDragging,
    setIsDragging,
    dragError,
    setDragError,
  };
};