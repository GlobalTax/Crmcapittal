import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Lead, CreateLeadData, UpdateLeadData, LeadStatus } from '@/types/Lead';
import * as leadsService from '@/services/leadsService';
import { toast } from 'sonner';
import { useOptimizedPolling } from './useOptimizedPolling';
import { useNotifications } from '@/contexts/NotificationContext';

export const useOptimizedLeads = (filters?: {
  status?: LeadStatus;
  assigned_to_id?: string;
}) => {
  const queryClient = useQueryClient();
  const { processLeadChanges } = useNotifications();
  const cacheKey = `leads_${JSON.stringify(filters || {})}`;

  const {
    data: leads = [],
    loading: isLoading,
    error,
    refetch
  } = useOptimizedPolling({
    queryKey: cacheKey,
    queryFn: async () => {
      console.log('Fetching leads with filters:', filters);
      const result = await leadsService.fetchLeads(filters);
      console.log('Fetched leads result:', result?.length, 'leads');
      return result;
    },
    interval: 120000, // 2 minutes for lead control center (reduced from 30s)
    priority: 'medium', // reduced from high
    cacheTtl: 300000, // 5 minute cache (increased from 1m)
    enabled: true
  });

  // Process lead changes for notifications when leads data changes
  useEffect(() => {
    if (leads && Array.isArray(leads) && leads.length > 0) {
      processLeadChanges(leads);
    }
  }, [leads, processLeadChanges]);

  const createMutation = useMutation({
    mutationFn: async (leadData: any) => {
      // Create the lead first
      const lead = await leadsService.createLead(leadData);
      
      // Auto-convert to contact, company, and deal
      try {
        const result = await leadsService.convertLeadToContact(lead.id, {
          createCompany: Boolean(leadData.company_name),
          createDeal: true
        });
        
        return { lead, conversion: result };
      } catch (error) {
        console.warn('Auto-conversion failed:', error);
        return { lead, conversion: null };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] }); 
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      refetch(); // Refresh our data
      
      const { lead, conversion } = result;
      const notifications = ['✅ Lead creado exitosamente'];
      
      if (conversion) {
        notifications.push('✅ Contacto creado automáticamente');
        if (conversion.companyId) {
          notifications.push('✅ Empresa creada automáticamente');
        }
        if (conversion.dealId) {
          notifications.push('✅ Oportunidad creada automáticamente');
        }
      }
      
      toast.success(notifications.join('\n'), {
        duration: 5000,
      });
    },
    onError: (error) => {
      console.error('Error creating lead:', error);
      toast.error('Error al crear el lead');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateLeadData }) =>
      leadsService.updateLead(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      refetch(); // Refresh our data
      toast.success('Lead actualizado exitosamente');
    },
    onError: (error) => {
      console.error('Error updating lead:', error);
      toast.error('Error al actualizar el lead');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: leadsService.deleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      refetch(); // Refresh our data
      toast.success('Lead eliminado exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting lead:', error);
      toast.error('Error al eliminar el lead');
    },
  });

  const convertMutation = useMutation({
    mutationFn: ({ leadId, options }: { leadId: string; options: { createCompany: boolean; createDeal: boolean } }) =>
      leadsService.convertLeadToContact(leadId, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      refetch(); // Refresh our data
      toast.success('Lead convertido a contacto exitosamente');
    },
    onError: (error) => {
      console.error('Error converting lead:', error);
      toast.error('Error al convertir el lead');
    },
  });

  return {
    leads,
    isLoading,
    error,
    refetch,
    createLead: createMutation.mutate,
    updateLead: updateMutation.mutate,
    deleteLead: deleteMutation.mutate,
    convertLead: convertMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isConverting: convertMutation.isPending,
  };
};