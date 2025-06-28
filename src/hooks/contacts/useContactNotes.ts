
import { useState, useEffect } from 'react';
import { ContactNote } from '@/types/Contact';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { fetchContactNotes, createContactNote } from './contactNotesService';

export const useContactNotes = (contactId?: string) => {
  const [notes, setNotes] = useState<ContactNote[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadNotes = async () => {
    if (!contactId) return;
    
    try {
      setLoading(true);
      const notesData = await fetchContactNotes(contactId);
      setNotes(notesData);
    } catch (error) {
      console.error('Error fetching contact notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (note: string, noteType: ContactNote['note_type'] = 'general') => {
    if (!contactId) return;
    
    try {
      const newNote = await createContactNote(contactId, note, noteType, user?.id);
      setNotes(prev => [newNote, ...prev]);
      toast({
        title: "Nota añadida",
        description: "La nota se ha guardado correctamente",
      });
      return newNote;
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
    loadNotes();
  }, [contactId]);

  return {
    notes,
    loading,
    addNote,
    refetch: loadNotes,
  };
};
