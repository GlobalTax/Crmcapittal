
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Contact, CreateContactData, UpdateContactData } from '@/types/Contact';
import { toast } from 'sonner';

export const useContacts = () => {
  const queryClient = useQueryClient();

  const {
    data: contacts = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('contact_status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contacts:', error);
        throw error;
      }

      return data as Contact[];
    },
  });

  const createContactMutation = useMutation({
    mutationFn: async (contactData: CreateContactData) => {
      const { data, error } = await supabase
        .from('contacts')
        .insert([{
          ...contactData,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          is_active: true,
          contact_status: contactData.contact_status || 'active',
          contact_roles: contactData.contact_roles || ['other'],
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating contact:', error);
        throw error;
      }

      return data as Contact;
    },
    onSuccess: (newContact) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contacto creado correctamente', {
        description: `${newContact.name} ha sido añadido como contacto.`
      });
    },
    onError: (error) => {
      console.error('Error creating contact:', error);
      toast.error('Error al crear el contacto', {
        description: 'Hubo un problema al crear el contacto. Inténtalo de nuevo.'
      });
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: async (contactData: UpdateContactData) => {
      const { id, ...updateData } = contactData;
      const { data, error } = await supabase
        .from('contacts')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating contact:', error);
        throw error;
      }

      return data as Contact;
    },
    onSuccess: (updatedContact) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contacto actualizado correctamente', {
        description: `${updatedContact.name} ha sido actualizado.`
      });
    },
    onError: (error) => {
      console.error('Error updating contact:', error);
      toast.error('Error al actualizar el contacto', {
        description: 'Hubo un problema al actualizar el contacto. Inténtalo de nuevo.'
      });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from('contacts')
        .update({ contact_status: 'archived' })
        .eq('id', contactId);

      if (error) {
        console.error('Error deleting contact:', error);
        throw error;
      }

      return contactId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contacto eliminado correctamente');
    },
    onError: (error) => {
      console.error('Error deleting contact:', error);
      toast.error('Error al eliminar el contacto', {
        description: 'Hubo un problema al eliminar el contacto. Inténtalo de nuevo.'
      });
    },
  });

  return {
    contacts,
    isLoading,
    error,
    refetch,
    createContact: createContactMutation.mutate,
    updateContact: updateContactMutation.mutate,
    deleteContact: deleteContactMutation.mutate,
    isCreating: createContactMutation.isPending,
    isUpdating: updateContactMutation.isPending,
    isDeleting: deleteContactMutation.isPending,
  };
};
