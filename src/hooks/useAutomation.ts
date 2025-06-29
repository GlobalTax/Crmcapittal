
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  trigger_type: string;
  trigger_config: Record<string, any>;
  conditions: any[];
  actions: any[];
  enabled: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export const useAutomation = () => {
  const queryClient = useQueryClient();

  // Fetch automation rules using raw query
  const {
    data: rules = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['automation-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('execute_sql', {
          query: 'SELECT * FROM automation_rules ORDER BY priority DESC'
        });

      if (error) {
        console.error('Error fetching automation rules:', error);
        // Fallback to empty array if table doesn't exist yet
        return [];
      }

      return (data || []) as AutomationRule[];
    },
  });

  // Create automation rule
  const createRuleMutation = useMutation({
    mutationFn: async (ruleData: Omit<AutomationRule, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .rpc('execute_sql', {
          query: `
            INSERT INTO automation_rules (name, description, trigger_type, trigger_config, conditions, actions, enabled, priority, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
          `,
          params: [
            ruleData.name,
            ruleData.description,
            ruleData.trigger_type,
            JSON.stringify(ruleData.trigger_config),
            JSON.stringify(ruleData.conditions),
            JSON.stringify(ruleData.actions),
            ruleData.enabled,
            ruleData.priority,
            ruleData.created_by
          ]
        });

      if (error) {
        console.error('Error creating automation rule:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast.success('Regla de automatización creada exitosamente');
    },
    onError: (error) => {
      console.error('Error creating rule:', error);
      toast.error('Error al crear la regla de automatización');
    },
  });

  // Update automation rule
  const updateRuleMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<AutomationRule> }) => {
      const { data, error } = await supabase
        .rpc('execute_sql', {
          query: `
            UPDATE automation_rules 
            SET name = COALESCE($2, name),
                description = COALESCE($3, description),
                trigger_type = COALESCE($4, trigger_type),
                trigger_config = COALESCE($5, trigger_config),
                conditions = COALESCE($6, conditions),
                actions = COALESCE($7, actions),
                enabled = COALESCE($8, enabled),
                priority = COALESCE($9, priority),
                updated_at = now()
            WHERE id = $1
            RETURNING *
          `,
          params: [
            id,
            updates.name,
            updates.description,
            updates.trigger_type,
            updates.trigger_config ? JSON.stringify(updates.trigger_config) : null,
            updates.conditions ? JSON.stringify(updates.conditions) : null,
            updates.actions ? JSON.stringify(updates.actions) : null,
            updates.enabled,
            updates.priority
          ]
        });

      if (error) {
        console.error('Error updating automation rule:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast.success('Regla de automatización actualizada exitosamente');
    },
    onError: (error) => {
      console.error('Error updating rule:', error);
      toast.error('Error al actualizar la regla de automatización');
    },
  });

  // Delete automation rule
  const deleteRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .rpc('execute_sql', {
          query: 'DELETE FROM automation_rules WHERE id = $1',
          params: [id]
        });

      if (error) {
        console.error('Error deleting automation rule:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast.success('Regla de automatización eliminada exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting rule:', error);
      toast.error('Error al eliminar la regla de automatización');
    },
  });

  // Toggle rule enabled/disabled
  const toggleRuleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { data, error } = await supabase
        .rpc('execute_sql', {
          query: 'UPDATE automation_rules SET enabled = $2, updated_at = now() WHERE id = $1 RETURNING *',
          params: [id, enabled]
        });

      if (error) {
        console.error('Error toggling automation rule:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast.success('Estado de la regla actualizado exitosamente');
    },
    onError: (error) => {
      console.error('Error toggling rule:', error);
      toast.error('Error al cambiar el estado de la regla');
    },
  });

  return {
    rules,
    isLoading,
    error,
    createRule: createRuleMutation.mutate,
    updateRule: updateRuleMutation.mutate,
    deleteRule: deleteRuleMutation.mutate,
    toggleRule: toggleRuleMutation.mutate,
    isCreating: createRuleMutation.isPending,
    isUpdating: updateRuleMutation.isPending,
    isDeleting: deleteRuleMutation.isPending,
    isToggling: toggleRuleMutation.isPending,
  };
};
