import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ContactNote {
  id: string;
  contact_id: string;
  note: string;
  note_type: string;
  created_by: string;
  created_at: string;
}

export function useContactNotes(contactId?: string) {
  const [notes, setNotes] = useState<ContactNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!contactId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('contact_notes')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setNotes((data || []) as ContactNote[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Crear nota
  const createNote = async (note: Omit<ContactNote, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('contact_notes')
        .insert([note])
        .select()
        .single();
        
      if (error) throw error;
      setNotes((prev) => [data as ContactNote, ...prev]);
      return data as ContactNote;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear nota');
      throw err;
    }
  };

  // Actualizar nota
  const updateNote = async (id: string, updates: Partial<ContactNote>) => {
    try {
      const { data, error } = await supabase
        .from('contact_notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      setNotes((prev) => prev.map((n) => (n.id === id ? data as ContactNote : n)));
      return data as ContactNote;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar nota');
      throw err;
    }
  };

  // Eliminar nota
  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_notes')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      setNotes((prev) => prev.filter((n) => n.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar nota');
      throw err;
    }
  };

  return {
    notes,
    loading,
    error,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
  };
}