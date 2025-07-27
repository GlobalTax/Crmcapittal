import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Lead } from '@/types/Lead';

export const useLeadAutomation = () => {
  const queryClient = useQueryClient();

  // Auto-assign lead based on rules
  const autoAssignMutation = useMutation({
    mutationFn: async (leadId: string) => {
      // Use the database function for automatic assignment
      const { data, error } = await supabase.rpc('auto_assign_lead', {
        p_lead_id: leadId
      });

      if (error) throw error;

      return { 
        leadId, 
        assignedUserId: data, 
        ruleName: data ? 'Automatic Assignment' : 'No Rule Matched' 
      };
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
      // Get active scoring rules with new column names
      const { data: rules, error } = await supabase
        .from('lead_scoring_rules')
        .select('*')
        .eq('activo', true);

      if (error) {
        throw error;
      }

      // Find matching rules using new column names
      const matchingRules = rules?.filter(rule => {
        const condition = rule.condicion as any;
        return condition?.activity_type === activityType;
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
            points_awarded: rule.valor,
            created_by: null
          });

        // Log score change using the new function
        await supabase.rpc('log_lead_score_change', {
          p_lead_id: leadId,
          p_regla: rule.nombre,
          p_delta: rule.valor,
          p_total: totalPoints + rule.valor
        });

        totalPoints += rule.valor;
      }

      if (totalPoints > 0) {
        // Update lead score
        await supabase.rpc('update_lead_score', {
          p_lead_id: leadId,
          p_points_to_add: totalPoints
        });

        // Calculate and update engagement score
        const { data: engagementScore } = await supabase.rpc('calculate_lead_engagement_score', {
          p_lead_id: leadId
        });

        if (engagementScore !== null) {
          // Update lead nurturing with new engagement score
          await supabase
            .from('lead_nurturing')
            .upsert({
              lead_id: leadId,
              engagement_score: engagementScore,
              updated_at: new Date().toISOString()
            });
        }
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