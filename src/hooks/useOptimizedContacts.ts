import { useState, useCallback, useEffect } from 'react';
import { Contact, CreateContactData, UpdateContactData } from '@/types/Contact';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOptimizedContacts = () => {
  const { toast } = useToast();
  
  // SIMPLIFIED: Direct state management without complex polling
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('🔄 SIMPLIFIED CONTACTS HOOK: Initializing...');

  const fetchContacts = useCallback(async () => {
    console.log('🚀 SIMPLIFIED FETCH: Starting direct Supabase call...');
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('contacts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        console.error('❌ SIMPLIFIED FETCH ERROR:', fetchError);
        setError(fetchError.message);
        setContacts([]);
        return;
      }
      
      console.log('✅ SIMPLIFIED FETCH SUCCESS:', data?.length || 0, 'contacts');
      console.log('📋 FIRST 3 CONTACTS:', data?.slice(0, 3).map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        contact_type: c.contact_type,
        is_active: c.is_active
      })));
      
      setContacts(data as Contact[] || []);
    } catch (err) {
      console.error('❌ SIMPLIFIED FETCH EXCEPTION:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setContacts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Simple polling every 10 seconds
  useEffect(() => {
    console.log('🔄 SIMPLIFIED CONTACTS: Setting up polling...');
    
    // Initial fetch
    fetchContacts();
    
    // Set up interval
    const interval = setInterval(() => {
      console.log('⏰ SIMPLIFIED CONTACTS: Interval fetch...');
      fetchContacts();
    }, 10000); // 10 seconds

    return () => {
      console.log('🔄 SIMPLIFIED CONTACTS: Cleaning up polling...');
      clearInterval(interval);
    };
  }, [fetchContacts]);

  const refetch = useCallback(() => {
    console.log('🔄 SIMPLIFIED CONTACTS: Manual refetch triggered...');
    return fetchContacts();
  }, [fetchContacts]);

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
      console.log('🔄 Forcing immediate contacts refresh...');
      // Immediate refetch without delay
      refetch();
      
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
    error,
    createContact,
    updateContact,
    deleteContact,
    getContactById,
    refetch
  };
};