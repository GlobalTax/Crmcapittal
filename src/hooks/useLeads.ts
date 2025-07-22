import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Lead, CreateLeadData, UpdateLeadData, LeadStatus } from '@/types/Lead';
import * as leadsService from '@/services/leadsService';
import { toast } from 'sonner';

export const useLeads = (filters?: {
  status?: LeadStatus;
  assigned_to_id?: string;
}) => {
  const queryClient = useQueryClient();

  const {
    data: leads = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['leads', filters],
    queryFn: () => leadsService.fetchLeads(filters),
  });

  const createMutation = useMutation({
    mutationFn: async (leadData: CreateLeadData) => {
      // Ensure service_type is included with default fallback
      const leadPayload = {
        ...leadData,
        service_type: leadData.service_type || 'mandato_venta'
      };
      
      // Create the lead first
      const lead = await leadsService.createLead(leadPayload);
      
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

export const useLead = (id: string) => {
  const {
    data: lead,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadsService.fetchLeadById(id),
    enabled: !!id,
  });

  return { lead, isLoading, error, refetch };
};
