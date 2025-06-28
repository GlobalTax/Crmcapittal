
import { useState, useEffect } from 'react';
import { Contact } from '@/types/Contact';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { fetchContacts, createContact, updateContact, deleteContact } from './contactsMainService';

export const useContactsMain = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadContacts = async () => {
    try {
      setLoading(true);
      const contactsData = await fetchContacts();
      setContacts(contactsData);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los contactos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContact = async (contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const newContact = await createContact(contactData, user?.id);
      setContacts(prev => [newContact, ...prev]);
      toast({
        title: "Éxito",
        description: "Contacto creado correctamente",
      });
      return newContact;
    } catch (error) {
      console.error('Error creating contact:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el contacto",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUpdateContact = async (id: string, updates: Partial<Contact>) => {
    try {
      const updatedContact = await updateContact(id, updates);
      setContacts(prev => prev.map(contact => 
        contact.id === id ? { ...contact, ...updatedContact } : contact
      ));
      
      toast({
        title: "Éxito",
        description: "Contacto actualizado correctamente",
      });
      return updatedContact;
    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el contacto",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      await deleteContact(id);
      setContacts(prev => prev.filter(contact => contact.id !== id));
      toast({
        title: "Éxito",
        description: "Contacto eliminado correctamente",
      });
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el contacto",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  return {
    contacts,
    loading,
    createContact: handleCreateContact,
    updateContact: handleUpdateContact,
    deleteContact: handleDeleteContact,
    refetch: loadContacts,
  };
};
