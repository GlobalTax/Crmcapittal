import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Contact, CreateContactData, UpdateContactData } from '@/types/Contact';
import { toast } from 'sonner';

interface LeadFilters {
  status?: string;
  assigned_to_id?: string;
  lead_source?: string;
}

export const useLeadContacts = (filters: LeadFilters = {}) => {
  const queryClient = useQueryClient();

  // Fetch leads (contacts with lifecycle_stage = 'lead')
  const { data: leads = [], isLoading, error, refetch } = useQuery({
    queryKey: ['lead-contacts', filters],
    queryFn: async () => {
      let query = supabase
        .from('contacts')
        .select('*')
        .eq('lifecycle_stage', 'marketing_qualified_lead')
        .order('created_at', { ascending: false });

      if (filters.status) {
        query = query.eq('lead_status', filters.status);
      }
      if (filters.assigned_to_id) {
        query = query.eq('assigned_to_id', filters.assigned_to_id);
      }
      if (filters.lead_source) {
        query = query.eq('lead_source', filters.lead_source);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Contact[];
    },
  });

  // Create lead (contact with lifecycle_stage = 'lead' and also in leads table)
  const createLeadMutation = useMutation({
    mutationFn: async (leadData: CreateContactData & { opportunity_name?: string; estimated_value?: number; close_date?: string; probability?: number }) => {
      // First check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Usuario no autenticado');
      }

      // Create contact with generated lead name
      const contactData = {
        ...leadData,
        contact_type: 'lead',
        lifecycle_stage: 'marketing_qualified_lead',
        lead_score: leadData.lead_score || 0,
        created_by: user.id,
      };

      const { data: contactResult, error: contactError } = await supabase
        .from('contacts')
        .insert(contactData)
        .select()
        .single();

      if (contactError) {
        console.error('Error creating contact:', contactError);
        throw new Error(`Error al crear contacto: ${contactError.message}`);
      }

      // Also create in leads table for lead management
      // Extract the original name or opportunity name from the generated lead name
      const opportunityName = leadData.opportunity_name || leadData.name || '';
      const leadNameMatch = leadData.name?.match(/^(.+) - \d{2}\/\d{2}\/\d{4}$/);
      const extractedOpportunityName = leadNameMatch ? leadNameMatch[1] : opportunityName;

      const leadRecord = {
        id: contactResult.id, // Use same ID as contact
        name: extractedOpportunityName,
        lead_name: leadData.name, // Store the generated name with date
        email: leadData.email,
        phone: leadData.phone,
        company_name: leadData.company,
        message: leadData.notes,
        source: leadData.lead_source || 'other',
        lead_origin: leadData.lead_origin || 'manual',
        status: 'NEW' as const,
        lead_score: leadData.lead_score || 0,
        estimated_value: leadData.estimated_value || null,
        close_date: leadData.close_date || null,
        probability: leadData.probability || 50,
      };

      const { error: leadError } = await supabase
        .from('leads')
        .insert(leadRecord);

      if (leadError) {
        console.error('Error creating lead record:', leadError);
        // Don't throw error here, contact was created successfully
        toast.error('Lead creado pero hubo un problema con el registro adicional');
      }

      return contactResult as Contact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-contacts'] });
      toast.success('Lead creado exitosamente');
    },
    onError: (error: any) => {
      console.error('Error creating lead:', error);
      const errorMessage = error?.message || 'Error al crear el lead';
      toast.error(errorMessage);
    },
  });

  // Update lead
  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateContactData }) => {
      // Update in dedicated leads table
      const leadUpdates = {
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
        company_name: updates.company,
        job_title: updates.position,
        lead_score: updates.lead_score,
        message: updates.notes
      };

      const { data, error } = await supabase
        .from('leads')
        .update(leadUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as any; // Lead data structure is different
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-contacts'] });
      toast.success('Lead actualizado exitosamente');
    },
    onError: (error) => {
      console.error('Error updating lead:', error);
      toast.error('Error al actualizar el lead');
    },
  });

  // Delete lead
  const deleteLeadMutation = useMutation({
    mutationFn: async (id: string) => {
      // Delete from dedicated leads table
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-contacts'] });
      toast.success('Lead eliminado exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting lead:', error);
      toast.error('Error al eliminar el lead');
    },
  });

  // Convert lead to client
  const convertLeadMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const { data, error } = await supabase
        .from('contacts')
        .update({
          lifecycle_stage: 'customer',
          contact_type: 'cliente',
          conversion_date: new Date().toISOString(),
        })
        .eq('id', leadId)
        .select()
        .single();

      if (error) throw error;
      return data as Contact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Lead convertido a cliente exitosamente');
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
    createLead: createLeadMutation.mutate,
    updateLead: updateLeadMutation.mutate,
    deleteLead: deleteLeadMutation.mutate,
    convertLead: convertLeadMutation.mutate,
    isCreating: createLeadMutation.isPending,
    isUpdating: updateLeadMutation.isPending,
    isDeleting: deleteLeadMutation.isPending,
    isConverting: convertLeadMutation.isPending,
  };
};

export const useLeadContact = (id: string) => {
  const { data: lead, isLoading, error, refetch } = useQuery({
    queryKey: ['lead-contact', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Contact;
    },
    enabled: !!id,
  });

  return { lead, isLoading, error, refetch };
};