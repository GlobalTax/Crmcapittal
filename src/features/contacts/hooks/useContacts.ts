/**
 * Contacts Hook
 * 
 * Main hook for contacts CRUD operations and state management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Contact, CreateContactData, UpdateContactData, UseContactsOptions } from '../types';
import { ContactService } from '../services/ContactService';
import { toast } from 'sonner';

export const useContacts = (options: UseContactsOptions = {}) => {
  const queryClient = useQueryClient();

  const {
    data: contactsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['contacts', options.page, options.limit, options.searchTerm, options.companyId, options.statusFilter, options.typeFilter],
    queryFn: () => ContactService.fetchContacts(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const createContactMutation = useMutation({
    mutationFn: async (contactData: CreateContactData) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("Usuario no autenticado");
      }
      
      return ContactService.createContact(contactData, user.id);
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
    mutationFn: (contactData: UpdateContactData) => ContactService.updateContact(contactData),
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
    mutationFn: (contactId: string) => ContactService.deleteContact(contactId),
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

  const linkContactToCompanyMutation = useMutation({
    mutationFn: ({ contactId, companyId, companyName }: { contactId: string; companyId: string; companyName: string }) => 
      ContactService.linkContactToCompany(contactId, companyId, companyName),
    onSuccess: (updatedContact) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contacto vinculado correctamente', {
        description: `${updatedContact.name} ha sido vinculado a la empresa.`
      });
    },
    onError: (error) => {
      console.error('Error linking contact to company:', error);
      toast.error('Error al vincular el contacto', {
        description: 'Hubo un problema al vincular el contacto. Inténtalo de nuevo.'
      });
    },
  });

  const unlinkContactFromCompanyMutation = useMutation({
    mutationFn: (contactId: string) => ContactService.unlinkContactFromCompany(contactId),
    onSuccess: (updatedContact) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contacto desvinculado correctamente', {
        description: `${updatedContact.name} ha sido desvinculado de la empresa.`
      });
    },
    onError: (error) => {
      console.error('Error unlinking contact from company:', error);
      toast.error('Error al desvincular el contacto', {
        description: 'Hubo un problema al desvincular el contacto. Inténtalo de nuevo.'
      });
    },
  });

  return {
    contacts: contactsData?.contacts || [],
    totalCount: contactsData?.totalCount || 0,
    currentPage: contactsData?.currentPage || 1,
    totalPages: contactsData?.totalPages || 1,
    isLoading,
    error,
    refetch,
    createContact: createContactMutation.mutate,
    updateContact: updateContactMutation.mutate,
    deleteContact: deleteContactMutation.mutate,
    linkContactToCompany: linkContactToCompanyMutation.mutate,
    unlinkContactFromCompany: unlinkContactFromCompanyMutation.mutate,
    isCreating: createContactMutation.isPending,
    isUpdating: updateContactMutation.isPending,
    isDeleting: deleteContactMutation.isPending,
    isLinking: linkContactToCompanyMutation.isPending,
    isUnlinking: unlinkContactFromCompanyMutation.isPending,
  };
};

export const useContact = (contactId: string) => {
  return useQuery({
    queryKey: ['contacts', contactId],
    queryFn: () => ContactService.fetchContactById(contactId),
    enabled: !!contactId,
    staleTime: 5 * 60 * 1000,
  });
};