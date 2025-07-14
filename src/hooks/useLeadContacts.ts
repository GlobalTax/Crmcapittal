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
        .eq('lifecycle_stage', 'lead')
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

  // Create lead (contact with lifecycle_stage = 'lead')
  const createLeadMutation = useMutation({
    mutationFn: async (leadData: CreateContactData) => {
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          ...leadData,
          contact_type: 'lead',
          lifecycle_stage: 'lead',
          lead_score: leadData.lead_score || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Contact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-contacts'] });
      toast.success('Lead creado exitosamente');
    },
    onError: (error) => {
      console.error('Error creating lead:', error);
      toast.error('Error al crear el lead');
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
          lifecycle_stage: 'cliente',
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