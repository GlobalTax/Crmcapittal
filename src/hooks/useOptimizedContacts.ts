import { useState, useCallback } from 'react';
import { Contact, CreateContactData, UpdateContactData } from '@/types/Contact';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedPolling } from './useOptimizedPolling';
import { useToast } from '@/hooks/use-toast';
import { supabaseQuery } from '@/services/requestManager';

export const useOptimizedContacts = () => {
  const { toast } = useToast();

  // Use optimized polling for contacts with much longer intervals to reduce React errors
  const {
    data: contacts = [],
    loading: isLoading,
    error,
    refetch
  } = useOptimizedPolling({
    queryKey: 'contacts_optimized',
    queryFn: async () => {
      console.log('🔄 Fetching contacts...');
      const result = await supabaseQuery<Contact[]>(
        'contacts',
        (query) => query
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false }),
        'contacts_list',
        'low', // Lower priority to reduce conflicts
        300000 // 5 minutes cache
      );
      console.log('✅ Contacts fetched:', result?.length || 0);
      return result;
    },
    interval: 600000, // 10 minutes polling - very conservative to avoid React errors
    priority: 'low',
    cacheTtl: 300000, // 5 minutes cache
    enabled: true,
    retryOnError: false // Disable retries to avoid error loops
  });

  const createContact = useCallback(async (contactData: CreateContactData) => {
    try {
      console.log('📝 Creating contact:', contactData.name);
      const { data: user } = await supabase.auth.getUser();
      
      if (!user?.user?.id) {
        throw new Error('Usuario no autenticado');
      }

      const insertData = {
        ...contactData,
        created_by: user.user.id
      };
      
      console.log('💾 Inserting contact data:', insertData);
      
      const { data, error } = await supabase
        .from('contacts')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error:', error);
        throw new Error(error.message);
      }
      
      console.log('✅ Contact created successfully:', data);
      
      toast({
        title: "Contacto creado",
        description: `${contactData.name} ha sido creado correctamente.`,
      });
      
      // Force immediate refresh to show new contact
      console.log('🔄 Forcing contacts refresh...');
      setTimeout(() => {
        refetch();
      }, 500); // Small delay to ensure DB consistency
      
      return data as Contact;
    } catch (err) {
      console.error('❌ Create contact error:', err);
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