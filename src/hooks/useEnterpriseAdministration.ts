import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ========== COLLABORATOR PERFORMANCE ==========
export interface CollaboratorPerformance {
  id: string;
  collaborator_id: string;
  period_start: string;
  period_end: string;
  total_revenue: number;
  deals_closed: number;
  leads_generated: number;
  conversion_rate: number;
  performance_score: number;
  ranking_position?: number;
  created_at: string;
  updated_at: string;
}

export const useCollaboratorPerformance = () => {
  const queryClient = useQueryClient();

  const { data: performance = [], isLoading, error } = useQuery({
    queryKey: ['collaborator-performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collaborator_performance')
        .select(`
          *,
          collaborators!inner (
            id, name, email, collaborator_type
          )
        `)
        .order('performance_score', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const updatePerformance = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CollaboratorPerformance> }) => {
      const { data, error } = await supabase
        .from('collaborator_performance')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborator-performance'] });
      toast.success('Performance actualizado correctamente');
    },
    onError: (error) => {
      toast.error('Error al actualizar performance: ' + error.message);
    },
  });

  return {
    performance,
    isLoading,
    error,
    updatePerformance: updatePerformance.mutate,
  };
};

// ========== COMMISSION CALCULATIONS ==========
export interface CommissionCalculation {
  id: string;
  collaborator_id: string;
  deal_id?: string;
  calculation_type: string;
  base_amount: number;
  commission_rate: number;
  calculated_amount: number;
  calculation_details: any;
  status: 'calculated' | 'approved' | 'disputed' | 'paid';
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export const useCommissionCalculations = () => {
  const queryClient = useQueryClient();

  const { data: commissions = [], isLoading, error } = useQuery({
    queryKey: ['commission-calculations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('commission_calculations')
        .select(`
          *,
          collaborators!inner (
            id, name, email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const createCommission = useMutation({
    mutationFn: async (commission: Omit<CommissionCalculation, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('commission_calculations')
        .insert(commission)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-calculations'] });
      toast.success('Comisión calculada correctamente');
    },
    onError: (error) => {
      toast.error('Error al calcular comisión: ' + error.message);
    },
  });

  const approveCommission = useMutation({
    mutationFn: async ({ id, approvedBy }: { id: string; approvedBy: string }) => {
      const { data, error } = await supabase
        .from('commission_calculations')
        .update({
          status: 'approved',
          approved_by: approvedBy,
          approved_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-calculations'] });
      toast.success('Comisión aprobada correctamente');
    },
    onError: (error) => {
      toast.error('Error al aprobar comisión: ' + error.message);
    },
  });

  return {
    commissions,
    isLoading,
    error,
    createCommission: createCommission.mutate,
    approveCommission: approveCommission.mutate,
  };
};

// ========== TERRITORIES ==========
export interface Territory {
  id: string;
  name: string;
  description?: string;
  territory_type: 'geographic' | 'sector' | 'account';
  boundaries: any;
  exclusivity_level: 'exclusive' | 'shared' | 'collaborative';
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useTerritories = () => {
  const queryClient = useQueryClient();

  const { data: territories = [], isLoading, error } = useQuery({
    queryKey: ['territories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('territories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    },
  });

  const createTerritory = useMutation({
    mutationFn: async (territory: Omit<Territory, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('territories')
        .insert(territory)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['territories'] });
      toast.success('Territorio creado correctamente');
    },
    onError: (error) => {
      toast.error('Error al crear territorio: ' + error.message);
    },
  });

  const updateTerritory = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Territory> }) => {
      const { data, error } = await supabase
        .from('territories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['territories'] });
      toast.success('Territorio actualizado correctamente');
    },
    onError: (error) => {
      toast.error('Error al actualizar territorio: ' + error.message);
    },
  });

  const deleteTerritory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('territories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['territories'] });
      toast.success('Territorio eliminado correctamente');
    },
    onError: (error) => {
      toast.error('Error al eliminar territorio: ' + error.message);
    },
  });

  return {
    territories,
    isLoading,
    error,
    createTerritory: createTerritory.mutate,
    updateTerritory: updateTerritory.mutate,
    deleteTerritory: deleteTerritory.mutate,
  };
};

// ========== INTEGRATION MARKETPLACE ==========
export interface Integration {
  id: string;
  name: string;
  description?: string;
  category: string;
  developer_name: string;
  version: string;
  icon_url?: string;
  pricing_model: 'free' | 'paid' | 'freemium';
  pricing_details: any;
  installation_count: number;
  rating: number;
  review_count: number;
  configuration_schema: any;
  status: 'pending' | 'approved' | 'rejected' | 'deprecated';
  created_at: string;
  updated_at: string;
}

export const useIntegrationMarketplace = () => {
  const queryClient = useQueryClient();

  const { data: integrations = [], isLoading, error } = useQuery({
    queryKey: ['integration-marketplace'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_marketplace')
        .select('*')
        .eq('status', 'approved')
        .order('installation_count', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const installIntegration = useMutation({
    mutationFn: async ({ integrationId, configuration }: { integrationId: string; configuration: any }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('user_integrations')
        .insert({
          user_id: user.user.id,
          integration_id: integrationId,
          configuration,
          sync_status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      // Increment installation count
      await supabase
        .from('integration_marketplace')
        .update({ installation_count: integrations.find(i => i.id === integrationId)?.installation_count + 1 })
        .eq('id', integrationId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['user-integrations'] });
      toast.success('Integración instalada correctamente');
    },
    onError: (error) => {
      toast.error('Error al instalar integración: ' + error.message);
    },
  });

  return {
    integrations,
    isLoading,
    error,
    installIntegration: installIntegration.mutate,
  };
};

// ========== WORKFLOW TEMPLATES ==========
export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  template_data: any;
  trigger_types: string[];
  action_types: string[];
  complexity_level: 'beginner' | 'intermediate' | 'advanced';
  usage_count: number;
  created_by?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export const useWorkflowTemplates = () => {
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading, error } = useQuery({
    queryKey: ['workflow-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_templates')
        .select('*')
        .order('usage_count', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const createWorkflow = useMutation({
    mutationFn: async ({ templateId, name, description }: { templateId: string; name: string; description?: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) throw new Error('Usuario no autenticado');

      const template = templates.find(t => t.id === templateId);
      if (!template) throw new Error('Template no encontrado');

      const { data, error } = await supabase
        .from('user_workflows')
        .insert({
          user_id: user.user.id,
          template_id: templateId,
          name,
          description,
          workflow_definition: template.template_data,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      // Increment usage count
      await supabase
        .from('workflow_templates')
        .update({ usage_count: template.usage_count + 1 })
        .eq('id', templateId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-templates'] });
      queryClient.invalidateQueries({ queryKey: ['user-workflows'] });
      toast.success('Workflow creado correctamente');
    },
    onError: (error) => {
      toast.error('Error al crear workflow: ' + error.message);
    },
  });

  return {
    templates,
    isLoading,
    error,
    createWorkflow: createWorkflow.mutate,
  };
};