
import { useCRUD } from '@/hooks/common';
import { Contact, CreateContactData } from '@/types/Contact';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';

export const useContactsCRUD = () => {
  const { toast } = useToast();

  const contactsCRUD = useCRUD<Contact>({
    onSuccess: (data) => {
      // Remove console.log to prevent spam
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    },
    retryCount: 2,
    retryDelay: 1000
  });

  const createContact = useCallback(async (contactData: CreateContactData) => {
    return contactsCRUD.create.execute(async () => {
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
      
      return data as Contact;
    });
  }, [contactsCRUD.create, toast]);

  const fetchContacts = useCallback(async () => {
    return contactsCRUD.read.execute(async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data || []) as Contact[];
    });
  }, [contactsCRUD.read]);

  const updateContact = useCallback(async (id: string, updates: Partial<Contact>) => {
    return contactsCRUD.update.execute(async () => {
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
      
      return data as Contact;
    });
  }, [contactsCRUD.update, toast]);

  const deleteContact = useCallback(async (id: string) => {
    return contactsCRUD.remove.execute(async () => {
      const { error } = await supabase
        .from('contacts')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw new Error(error.message);
      
      toast({
        title: "Contacto eliminado",
        description: "El contacto ha sido eliminado correctamente.",
      });
    });
  }, [contactsCRUD.remove, toast]);

  return {
    createContact,
    fetchContacts,
    updateContact,
    deleteContact,
    
    // States for each operation
    isCreating: contactsCRUD.create.loading,
    isFetching: contactsCRUD.read.loading,
    isUpdating: contactsCRUD.update.loading,
    isDeleting: contactsCRUD.remove.loading,
    
    // Data from operations
    createdContact: contactsCRUD.create.data,
    fetchedContacts: contactsCRUD.read.data,
    updatedContact: contactsCRUD.update.data,
    
    // Errors
    createError: contactsCRUD.create.error,
    fetchError: contactsCRUD.read.error,
    updateError: contactsCRUD.update.error,
    deleteError: contactsCRUD.remove.error,
    
    // Control functions
    cancelCreate: contactsCRUD.create.cancel,
    cancelFetch: contactsCRUD.read.cancel,
    cancelUpdate: contactsCRUD.update.cancel,
    cancelDelete: contactsCRUD.remove.cancel
  };
};
