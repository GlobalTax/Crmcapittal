import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Opportunity, CreateOpportunityData, UpdateOpportunityData, OpportunityWithContacts, OpportunityContact } from '@/types/Opportunity';
import { toast } from 'sonner';
import { AutomationService } from '@/services/automationService';

export const useOpportunities = () => {
  const queryClient = useQueryClient();

  const {
    data: opportunities = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          company:companies(id, name, industry),
          opportunity_contacts(
            id,
            contact_id,
            role,
            is_primary,
            notes,
            contact:contacts(id, name, email, phone, position)
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching opportunities:', error);
        throw error;
      }

      return data as OpportunityWithContacts[];
    },
  });

  const createOpportunityMutation = useMutation({
    mutationFn: async (opportunityData: CreateOpportunityData) => {
      const { data, error } = await supabase
        .from('opportunities')
        .insert([{
          ...opportunityData,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          is_active: true,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating opportunity:', error);
        throw error;
      }

      return data as Opportunity;
    },
    onSuccess: (newOpportunity) => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('Oportunidad creada correctamente', {
        description: `${newOpportunity.title} ha sido añadida.`
      });
    },
    onError: (error) => {
      console.error('Error creating opportunity:', error);
      toast.error('Error al crear la oportunidad', {
        description: 'Hubo un problema al crear la oportunidad. Inténtalo de nuevo.'
      });
    },
  });

  const updateOpportunityMutation = useMutation({
    mutationFn: async (opportunityData: UpdateOpportunityData) => {
      const { id, ...updateData } = opportunityData;
      
      // Get current opportunity for stage change detection
      const { data: currentOpportunity } = await supabase
        .from('opportunities')
        .select('stage')
        .eq('id', id)
        .single();
      
      const { data, error } = await supabase
        .from('opportunities')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating opportunity:', error);
        throw error;
      }

      // Trigger automation if stage changed
      if (currentOpportunity && updateData.stage && currentOpportunity.stage !== updateData.stage) {
        try {
          await AutomationService.onDealStageUpdate(
            currentOpportunity.stage,
            updateData.stage,
            id,
            'deal'
          );
        } catch (automationError) {
          console.error('Error triggering automation:', automationError);
          // Don't fail the update if automation fails
        }
      }

      return data as Opportunity;
    },
    onSuccess: (updatedOpportunity) => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('Oportunidad actualizada correctamente', {
        description: `${updatedOpportunity.title} ha sido actualizada.`
      });
    },
    onError: (error) => {
      console.error('Error updating opportunity:', error);
      toast.error('Error al actualizar la oportunidad', {
        description: 'Hubo un problema al actualizar la oportunidad. Inténtalo de nuevo.'
      });
    },
  });

  const deleteOpportunityMutation = useMutation({
    mutationFn: async (opportunityId: string) => {
      const { error } = await supabase
        .from('opportunities')
        .update({ is_active: false })
        .eq('id', opportunityId);

      if (error) {
        console.error('Error deleting opportunity:', error);
        throw error;
      }

      return opportunityId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('Oportunidad eliminada correctamente');
    },
    onError: (error) => {
      console.error('Error deleting opportunity:', error);
      toast.error('Error al eliminar la oportunidad', {
        description: 'Hubo un problema al eliminar la oportunidad. Inténtalo de nuevo.'
      });
    },
  });

  return {
    opportunities,
    isLoading,
    error,
    refetch,
    createOpportunity: createOpportunityMutation.mutate,
    updateOpportunity: updateOpportunityMutation.mutate,
    deleteOpportunity: deleteOpportunityMutation.mutate,
    isCreating: createOpportunityMutation.isPending,
    isUpdating: updateOpportunityMutation.isPending,
    isDeleting: deleteOpportunityMutation.isPending,
  };
};

// Hook específico para obtener oportunidades de un contacto
export const useContactOpportunities = (contactId: string) => {
  return useQuery({
    queryKey: ['contact-opportunities', contactId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunity_contacts')
        .select(`
          id,
          role,
          is_primary,
          notes,
          opportunity:opportunities(
            id,
            title,
            stage,
            status,
            value,
            currency,
            opportunity_type,
            company:companies(id, name)
          )
        `)
        .eq('contact_id', contactId)
        .eq('opportunity.is_active', true);

      if (error) {
        console.error('Error fetching contact opportunities:', error);
        throw error;
      }

      return data;
    },
    enabled: !!contactId,
  });
};

// Hook para gestionar contactos de una oportunidad
export const useOpportunityContacts = (opportunityId: string) => {
  const queryClient = useQueryClient();

  const addContactMutation = useMutation({
    mutationFn: async ({ contactId, role, isPrimary = false, notes }: { 
      contactId: string; 
      role: string; 
      isPrimary?: boolean; 
      notes?: string; 
    }) => {
      const { data, error } = await supabase
        .from('opportunity_contacts')
        .insert([{
          opportunity_id: opportunityId,
          contact_id: contactId,
          role,
          is_primary: isPrimary,
          notes,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['contact-opportunities'] });
      toast.success('Contacto añadido a la oportunidad');
    },
    onError: (error) => {
      console.error('Error adding contact to opportunity:', error);
      toast.error('Error al añadir contacto a la oportunidad');
    },
  });

  const removeContactMutation = useMutation({
    mutationFn: async (opportunityContactId: string) => {
      const { error } = await supabase
        .from('opportunity_contacts')
        .delete()
        .eq('id', opportunityContactId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['contact-opportunities'] });
      toast.success('Contacto eliminado de la oportunidad');
    },
    onError: (error) => {
      console.error('Error removing contact from opportunity:', error);
      toast.error('Error al eliminar contacto de la oportunidad');
    },
  });

  return {
    addContact: addContactMutation.mutate,
    removeContact: removeContactMutation.mutate,
    isAdding: addContactMutation.isPending,
    isRemoving: removeContactMutation.isPending,
  };
};