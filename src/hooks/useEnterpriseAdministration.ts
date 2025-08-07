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

  // Mock performance data
  const mockPerformance = [
    {
      id: '1',
      collaborator_id: '1',
      period_start: '2024-01-01',
      period_end: '2024-01-31',
      total_revenue: 125000,
      deals_closed: 15,
      leads_generated: 45,
      conversion_rate: 33.3,
      performance_score: 92,
      ranking_position: 1,
      created_at: '2024-01-01',
      updated_at: '2024-01-31',
      collaborators: { id: '1', name: 'Ana García', email: 'ana@example.com', collaborator_type: 'referente' }
    },
    {
      id: '2',
      collaborator_id: '2', 
      period_start: '2024-01-01',
      period_end: '2024-01-31',
      total_revenue: 98000,
      deals_closed: 12,
      leads_generated: 38,
      conversion_rate: 31.6,
      performance_score: 87,
      ranking_position: 2,
      created_at: '2024-01-01',
      updated_at: '2024-01-31',
      collaborators: { id: '2', name: 'Carlos López', email: 'carlos@example.com', collaborator_type: 'partner_comercial' }
    }
  ];

  const { data: performance = mockPerformance, isLoading = false, error = null } = useQuery({
    queryKey: ['collaborator-performance'],
    queryFn: async () => {
      return mockPerformance;
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

  // Mock commission data
  const mockCommissions = [
    {
      id: '1',
      collaborator_id: '1',
      deal_id: 'deal-1',
      calculation_type: 'percentage',
      base_amount: 50000,
      commission_rate: 5,
      calculated_amount: 2500,
      calculation_details: { method: 'percentage' },
      status: 'calculated' as const,
      created_at: '2024-01-15',
      updated_at: '2024-01-15',
      collaborators: { id: '1', name: 'Ana García', email: 'ana@example.com' }
    },
    {
      id: '2',
      collaborator_id: '2',
      deal_id: 'deal-2', 
      calculation_type: 'percentage',
      base_amount: 75000,
      commission_rate: 4,
      calculated_amount: 3000,
      calculation_details: { method: 'percentage' },
      status: 'approved' as const,
      approved_by: 'admin-1',
      approved_at: '2024-01-16',
      created_at: '2024-01-15',
      updated_at: '2024-01-16',
      collaborators: { id: '2', name: 'Carlos López', email: 'carlos@example.com' }
    },
    {
      id: '3',
      collaborator_id: '1',
      deal_id: 'deal-3',
      calculation_type: 'percentage',
      base_amount: 45000,
      commission_rate: 5,
      calculated_amount: 2250,
      calculation_details: { method: 'percentage' },
      status: 'disputed' as const,
      created_at: '2024-01-10',
      updated_at: '2024-01-12',
      collaborators: { id: '1', name: 'Ana García', email: 'ana@example.com' }
    },
    {
      id: '4',
      collaborator_id: '2',
      deal_id: 'deal-4',
      calculation_type: 'percentage',
      base_amount: 120000,
      commission_rate: 3,
      calculated_amount: 3600,
      calculation_details: { method: 'percentage' },
      status: 'paid' as const,
      approved_by: 'admin-1',
      approved_at: '2024-01-05',
      created_at: '2024-01-03',
      updated_at: '2024-01-05',
      collaborators: { id: '2', name: 'Carlos López', email: 'carlos@example.com' }
    }
  ];

  const { data: commissions = mockCommissions, isLoading = false, error = null } = useQuery({
    queryKey: ['commission-calculations'],
    queryFn: async () => {
      return mockCommissions;
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

  // Mock territories data
  const mockTerritories = [
    {
      id: '1',
      name: 'Madrid Centro',
      description: 'Centro de Madrid y alrededores',
      territory_type: 'geographic' as const,
      boundaries: { coordinates: [{ lat: 40.4168, lng: -3.7038 }], radius: 25 },
      exclusivity_level: 'shared' as const,
      created_by: 'admin-1',
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    },
    {
      id: '2',
      name: 'Sector Tecnológico',
      description: 'Empresas de tecnología y software',
      territory_type: 'sector' as const,
      boundaries: { industries: ['technology', 'software', 'fintech'] },
      exclusivity_level: 'exclusive' as const,
      created_by: 'admin-1', 
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    },
    {
      id: '3',
      name: 'Grandes Cuentas',
      description: 'Cuentas empresariales >50M facturación',
      territory_type: 'account' as const,
      boundaries: { criteria: { min_revenue: 50000000 } },
      exclusivity_level: 'collaborative' as const,
      created_by: 'admin-1',
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    }
  ];

  const { data: territories = mockTerritories, isLoading = false, error = null } = useQuery({
    queryKey: ['territories'],
    queryFn: async () => {
      return mockTerritories;
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

  // Mock data for integrations marketplace
  const mockIntegrations = [
    {
      id: '1',
      name: 'Salesforce Connector',
      description: 'Sincronización bidireccional con Salesforce CRM',
      category: 'CRM',
      developer_name: 'Lovable Team',
      version: '2.1.0',
      pricing_model: 'paid' as const,
      installation_count: 1247,
      rating: 4.8,
      review_count: 156,
      status: 'approved' as const
    },
    {
      id: '2',
      name: 'HubSpot Integration',
      description: 'Integración completa con HubSpot Marketing',
      category: 'Marketing',
      developer_name: 'Lovable Team',
      version: '1.5.0',
      pricing_model: 'freemium' as const,
      installation_count: 892,
      rating: 4.6,
      review_count: 89,
      status: 'approved' as const
    },
    {
      id: '3',
      name: 'Slack Notifications',
      description: 'Notificaciones automáticas en Slack',
      category: 'Communication',
      developer_name: 'Lovable Team',
      version: '1.0.0',
      pricing_model: 'free' as const,
      installation_count: 653,
      rating: 4.4,
      review_count: 67,
      status: 'approved' as const
    }
  ];

  const { data: integrations = mockIntegrations, isLoading = false, error = null } = useQuery({
    queryKey: ['integration-marketplace'],
    queryFn: async () => {
      // Return mock data for now
      return mockIntegrations;
    },
  });

  const installIntegration = useMutation({
    mutationFn: async ({ integrationId, configuration }: { integrationId: string; configuration: any }) => {
      // Mock installation
      console.log('Installing integration:', integrationId, configuration);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-marketplace'] });
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

  // Mock workflow templates
  const mockTemplates = [
    {
      id: '1',
      name: 'Lead Nurturing Sequence',
      description: 'Secuencia automática de nurturing para nuevos leads',
      category: 'Sales',
      template_data: {},
      usage_count: 245,
      complexity_level: 'beginner' as const,
      is_public: true
    },
    {
      id: '2', 
      name: 'Deal Stage Automation',
      description: 'Automatización basada en cambios de stage de deals',
      category: 'Sales',
      template_data: {},
      usage_count: 189,
      complexity_level: 'intermediate' as const,
      is_public: true
    }
  ];

  const { data: templates = mockTemplates, isLoading = false, error = null } = useQuery({
    queryKey: ['workflow-templates'],
    queryFn: async () => {
      return mockTemplates;
    },
  });

  const createWorkflow = useMutation({
    mutationFn: async ({ templateId, name, description }: { templateId: string; name: string; description?: string }) => {
      console.log('Creating workflow:', templateId, name, description);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-templates'] });
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