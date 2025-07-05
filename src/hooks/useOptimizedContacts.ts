import { useState, useCallback } from 'react';
import { Contact, CreateContactData, UpdateContactData } from '@/types/Contact';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedPolling } from './useOptimizedPolling';
import { useToast } from '@/hooks/use-toast';
import { supabaseQuery } from '@/services/requestManager';

export const useOptimizedContacts = () => {
  const { toast } = useToast();

  // Use optimized polling for contacts with longer intervals to reduce rate limiting
  const {
    data: contacts = [],
    loading: isLoading,
    error,
    refetch
  } = useOptimizedPolling({
    queryKey: 'contacts_optimized',
    queryFn: async () => {
      return supabaseQuery<Contact[]>(
        'contacts',
        (query) => query
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false }),
        'contacts_list',
        'medium',
        240000 // 4 minutes cache
      );
    },
    interval: 300000, // 5 minutes polling - much more conservative
    priority: 'medium',
    cacheTtl: 240000, // 4 minutes cache
    enabled: true
  });

  const createContact = useCallback(async (contactData: CreateContactData) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('contacts')
        .insert([{
          ...contactData,
          created_by: user?.user?.id
        }])
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      toast({
        title: "Contacto creado",
        description: `${contactData.name} ha sido creado correctamente.`,
      });
      
      // Refresh contacts after creation
      refetch();
      
      return data as Contact;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear contacto';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [toast, refetch]);

  const updateContact = useCallback(async (id: string, updates: UpdateContactData) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      toast({
        title: "Contacto actualizado",
        description: "Los cambios han sido guardados correctamente.",
      });
      
      // Refresh contacts after update
      refetch();
      
      return data as Contact;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar contacto';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [toast, refetch]);

  const deleteContact = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw new Error(error.message);
      
      toast({
        title: "Contacto eliminado",
        description: "El contacto ha sido eliminado correctamente.",
      });
      
      // Refresh contacts after deletion
      refetch();
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar contacto';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [toast, refetch]);

  const getContactById = useCallback((id: string) => {
    return contacts.find(contact => contact.id === id) || null;
  }, [contacts]);

  return {
    contacts,
    isLoading,
    error: error?.message || null,
    createContact,
    updateContact,
    deleteContact,
    getContactById,
    refetch
  };
};