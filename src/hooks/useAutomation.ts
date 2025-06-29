
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

  // Fetch automation rules
  const {
    data: rules = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['automation-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .order('priority', { ascending: false });

      if (error) {
        console.error('Error fetching automation rules:', error);
        throw error;
      }

      return data as AutomationRule[];
    },
  });

  // Create automation rule
  const createRuleMutation = useMutation({
    mutationFn: async (ruleData: Omit<AutomationRule, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('automation_rules')
        .insert([ruleData])
        .select()
        .single();

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
        .from('automation_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

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
        .from('automation_rules')
        .delete()
        .eq('id', id);

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
        .from('automation_rules')
        .update({ enabled })
        .eq('id', id)
        .select()
        .single();

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
