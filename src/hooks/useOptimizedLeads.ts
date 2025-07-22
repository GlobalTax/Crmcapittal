
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Lead, CreateLeadData, UpdateLeadData, LeadStatus } from '@/types/Lead';
import * as leadsService from '@/services/leadsService';
import { toast } from 'sonner';
import { useOptimizedPolling } from './useOptimizedPolling';
import { useNotifications } from '@/contexts/NotificationContext';
import { logger } from '@/utils/logger';

export const useOptimizedLeads = (filters?: {
  status?: LeadStatus;
  assigned_to_id?: string;
}) => {
  const queryClient = useQueryClient();
  const { processLeadChanges } = useNotifications();
  const cacheKey = `leads_${JSON.stringify(filters || {})}`;

  // Usar datos optimizados con cache y debounce
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const result = await leadsService.fetchLeads(filters);
      setLeads(result || []);
      setError(null);
      
      logger.debug('Leads fetched successfully', {
        count: result?.length || 0,
        filters
      });
    } catch (err) {
      logger.error('Error fetching leads', err);
      setError(err as Error);
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    return fetchData();
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 100); // Small debounce to prevent rapid refetches

    return () => clearTimeout(timeoutId);
  }, [JSON.stringify(filters || {})]);

  // Process lead changes for notifications when leads data changes
  useEffect(() => {
    if (leads && Array.isArray(leads) && leads.length > 0) {
      processLeadChanges(leads);
    }
  }, [leads, processLeadChanges]);

  const createMutation = useMutation({
    mutationFn: async (leadData: any) => {
      logger.info('Creating new lead', { leadData });
      
      // Create the lead first with service_type
      const leadPayload = {
        ...leadData,
        service_type: leadData.service_type || 'mandato_venta' // Default fallback
      };
      
      const lead = await leadsService.createLead(leadPayload);
      
      // Auto-convert to contact, company, and deal
      try {
        const result = await leadsService.convertLeadToContact(lead.id, {
          createCompany: Boolean(leadData.company_name),
          createDeal: true
        });
        
        logger.info('Lead auto-conversion completed', { leadId: lead.id, result });
        return { lead, conversion: result };
      } catch (error) {
        logger.warn('Auto-conversion failed', { leadId: lead.id, error });
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
      logger.error('Error creating lead', error);
      toast.error('Error al crear el lead');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateLeadData }) => {
      logger.info('Updating lead', { id, updates });
      return leadsService.updateLead(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      refetch(); // Refresh our data
      toast.success('Lead actualizado exitosamente');
    },
    onError: (error) => {
      logger.error('Error updating lead', error);
      toast.error('Error al actualizar el lead');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      logger.info('Deleting lead', { id });
      return leadsService.deleteLead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      refetch(); // Refresh our data
      toast.success('Lead eliminado exitosamente');
    },
    onError: (error) => {
      logger.error('Error deleting lead', error);
      toast.error('Error al eliminar el lead');
    },
  });

  const convertMutation = useMutation({
    mutationFn: ({ leadId, options }: { leadId: string; options: { createCompany: boolean; createDeal: boolean } }) => {
      logger.info('Converting lead', { leadId, options });
      return leadsService.convertLeadToContact(leadId, options);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      refetch(); // Refresh our data
      toast.success('Lead convertido a contacto exitosamente');
    },
    onError: (error) => {
      logger.error('Error converting lead', error);
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
