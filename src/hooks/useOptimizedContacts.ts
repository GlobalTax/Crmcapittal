import { useState, useCallback, useEffect } from 'react';
import { Contact, CreateContactData, UpdateContactData } from '@/types/Contact';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOptimizedContacts = () => {
  const { toast } = useToast();
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('contacts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        setError(fetchError.message);
        setContacts([]);
        return;
      }
      
      setContacts(data as Contact[] || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setContacts([]);
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
      const { data: user } = await supabase.auth.getUser();
      
      if (!user?.user?.id) {
        throw new Error('Usuario no autenticado');
      }

      const insertData = {
        ...contactData,
        created_by: user.user.id
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
    error,
    createContact,
    updateContact,
    deleteContact,
    getContactById,
    refetch
  };
};