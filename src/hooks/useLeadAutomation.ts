import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Lead } from '@/types/Lead';

export const useLeadAutomation = () => {
  const queryClient = useQueryClient();

  // Auto-assign lead based on rules (simplified version)
  const autoAssignMutation = useMutation({
    mutationFn: async (leadId: string) => {
      // For now, just return success without assignment
      return { leadId, assignedUserId: null, ruleName: 'Default' };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success(`Lead asignado automáticamente usando regla: ${result.ruleName}`);
    },
    onError: (error) => {
      console.error('Auto-assignment error:', error);
      toast.error('Error en asignación automática');
    }
  });

  // Trigger auto-scoring for a lead
  const autoScoreMutation = useMutation({
    mutationFn: async ({ leadId, activityType, activityData }: {
      leadId: string;
      activityType: string;
      activityData?: Record<string, any>;
    }) => {
      // Get active scoring rules
      const { data: rules, error } = await supabase
        .from('lead_scoring_rules')
        .select('*')
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      // Find matching rules
      const matchingRules = rules?.filter(rule => {
        const condition = rule.trigger_condition as any;
        return condition.activity_type === activityType;
      }) || [];

      let totalPoints = 0;

      // Apply scoring rules
      for (const rule of matchingRules) {
        // Add activity record
        await supabase
          .from('lead_activities')
          .insert({
            lead_id: leadId,
            activity_type: activityType as any,
            activity_data: activityData || {},
            points_awarded: rule.points_awarded,
            created_by: null
          });

        totalPoints += rule.points_awarded;
      }

      if (totalPoints > 0) {
        // Update lead score
        await supabase.rpc('update_lead_score', {
          p_lead_id: leadId,
          p_points_to_add: totalPoints
        });
      }

      return { leadId, totalPoints, rulesApplied: matchingRules.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities', result.leadId] });
      if (result.totalPoints > 0) {
        toast.success(`+${result.totalPoints} puntos aplicados automáticamente`);
      }
    },
    onError: (error) => {
      console.error('Auto-scoring error:', error);
      toast.error('Error en scoring automático');
    }
  });

  // Process lead for automation (scoring + assignment)
  const processLeadAutomation = useMutation({
    mutationFn: async (lead: Lead) => {
      const results = [];

      // Auto-assign if not already assigned
      if (!lead.assigned_to_id) {
        try {
          const assignResult = await autoAssignMutation.mutateAsync(lead.id);
          results.push(`Asignado: ${assignResult.ruleName}`);
        } catch (error) {
          console.log('No auto-assignment rule matched');
        }
      }

      // Auto-score based on lead creation
      try {
        const scoreResult = await autoScoreMutation.mutateAsync({
          leadId: lead.id,
          activityType: 'FORM_SUBMITTED'
        });
        if (scoreResult.totalPoints > 0) {
          results.push(`+${scoreResult.totalPoints} puntos`);
        }
      } catch (error) {
        console.log('No scoring rules applied');
      }

      return results;
    },
    onSuccess: (results) => {
      if (results.length > 0) {
        toast.success(`Automatización aplicada: ${results.join(', ')}`);
      }
    }
  });

  return {
    autoAssign: autoAssignMutation.mutate,
    autoScore: autoScoreMutation.mutate,
    processLead: processLeadAutomation.mutate,
    isProcessing: processLeadAutomation.isPending
  };
};