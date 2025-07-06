import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TransaccionNote {
  id: string;
  transaccion_id: string;
  note: string;
  note_type: 'general' | 'meeting' | 'call' | 'email' | 'important';
  created_at: string;
  created_by?: string;
}

export const useTransaccionNotes = (transaccionId: string) => {
  const [notes, setNotes] = useState<TransaccionNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchNotes = async () => {
    if (!transaccionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // For now, we'll use mock data since we need to establish the relationship
      // In a real implementation, you could use contact_notes table or create a transaccion_notes table
      const mockNotes: TransaccionNote[] = [];

      setNotes(mockNotes);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar las notas';
      setError(errorMessage);
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (noteData: Omit<TransaccionNote, 'id' | 'created_at'>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const newNote: TransaccionNote = {
        ...noteData,
        id: Date.now().toString(),
        created_by: user?.user?.id,
        created_at: new Date().toISOString()
      };

      setNotes(prev => [newNote, ...prev]);
      
      toast({
        title: "Nota agregada",
        description: "La nota ha sido guardada correctamente.",
      });

      return { data: newNote, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la nota';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error creating note:', err);
      return { data: null, error: errorMessage };
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      setNotes(prev => prev.filter(note => note.id !== noteId));
      
      toast({
        title: "Nota eliminada",
        description: "La nota ha sido eliminada correctamente.",
      });

      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar la nota';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error deleting note:', err);
      return { error: errorMessage };
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [transaccionId]);

  return {
    notes,
    loading,
    error,
    createNote,
    deleteNote,
    refetch: fetchNotes
  };
};