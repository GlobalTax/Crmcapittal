
import { useState, useCallback, useEffect } from 'react';
import { Contact, CreateContactData, UpdateContactData } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

export const useOptimizedContacts = () => {
  const { toast } = useToast();
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      logger.debug('Fetching contacts...');
      
      const { data, error: fetchError } = await supabase
        .from('contacts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        setError(fetchError.message);
        setContacts([]);
        logger.error('Error fetching contacts', fetchError);
        return;
      }
      
      setContacts(data as Contact[] || []);
      logger.debug('Contacts fetched successfully', { count: data?.length || 0 });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setContacts([]);
      logger.error('Unexpected error fetching contacts', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Polling every 5 minutes for production
  useEffect(() => {
    fetchContacts();
    
    const interval = setInterval(() => {
      fetchContacts();
    }, 300000); // 5 minutes

    return () => {
      clearInterval(interval);
    };
  }, [fetchContacts]);

  const refetch = useCallback(() => {
    return fetchContacts();
  }, [fetchContacts]);

  const createContact = useCallback(async (contactData: CreateContactData) => {
    try {
      logger.info('Creating contact', { contactData });
      
      const { data: user } = await supabase.auth.getUser();
      
      if (!user?.user?.id) {
        throw new Error('Usuario no autenticado');
      }

      const insertData = {
        ...contactData,
        created_by: user.user.id,
        // Ensure default values for required fields
        contact_status: contactData.contact_status || 'active',
        contact_roles: contactData.contact_roles || ['other'],
      };
      
      const { data, error } = await supabase
        .from('contacts')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: "Contacto creado",
        description: `${contactData.name} ha sido creado correctamente.`,
      });
      
      refetch();
      
      return data as Contact;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear contacto';
      logger.error('Error creating contact', err);
      
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
      logger.info('Updating contact', { id, updates });
      
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
      logger.error('Error updating contact', err);
      
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
      logger.info('Deleting contact', { id });
      
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
      logger.error('Error deleting contact', err);
      
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
    error,
    createContact,
    updateContact,
    deleteContact,
    getContactById,
    refetch
  };
};
