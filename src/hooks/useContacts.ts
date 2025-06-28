
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Contact, ContactNote, ContactOperation, ContactType } from '@/types/Contact';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast the data to ensure proper typing
      const typedContacts = (data || []).map(contact => ({
        ...contact,
        contact_type: contact.contact_type as ContactType
      }));
      
      setContacts(typedContacts);
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

  const createContact = async (contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert([{ ...contactData, created_by: user?.id }])
        .select()
        .single();

      if (error) throw error;
      
      // Cast the returned data
      const typedContact = {
        ...data,
        contact_type: data.contact_type as ContactType
      };
      
      setContacts(prev => [typedContact, ...prev]);
      toast({
        title: "Éxito",
        description: "Contacto creado correctamente",
      });
      return typedContact;
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

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Cast the returned data
      const typedContact = {
        ...data,
        contact_type: data.contact_type as ContactType
      };
      
      setContacts(prev => prev.map(contact => 
        contact.id === id ? { ...contact, ...typedContact } : contact
      ));
      
      toast({
        title: "Éxito",
        description: "Contacto actualizado correctamente",
      });
      return typedContact;
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

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
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
    fetchContacts();
  }, []);

  return {
    contacts,
    loading,
    createContact,
    updateContact,
    deleteContact,
    refetch: fetchContacts,
  };
};

export const useContactNotes = (contactId?: string) => {
  const [notes, setNotes] = useState<ContactNote[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchNotes = async () => {
    if (!contactId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_notes')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast the data to ensure proper typing
      const typedNotes = (data || []).map(note => ({
        ...note,
        note_type: note.note_type as ContactNote['note_type']
      }));
      
      setNotes(typedNotes);
    } catch (error) {
      console.error('Error fetching contact notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (note: string, noteType: ContactNote['note_type'] = 'general') => {
    if (!contactId) return;
    
    try {
      const { data, error } = await supabase
        .from('contact_notes')
        .insert([{
          contact_id: contactId,
          note,
          note_type: noteType,
          created_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Cast the returned data
      const typedNote = {
        ...data,
        note_type: data.note_type as ContactNote['note_type']
      };
      
      setNotes(prev => [typedNote, ...prev]);
      toast({
        title: "Nota añadida",
        description: "La nota se ha guardado correctamente",
      });
      return typedNote;
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la nota",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [contactId]);

  return {
    notes,
    loading,
    addNote,
    refetch: fetchNotes,
  };
};
