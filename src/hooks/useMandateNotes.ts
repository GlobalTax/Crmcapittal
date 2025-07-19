import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MandateNote {
  id: string;
  mandate_id: string;
  note: string;
  note_type: string;
  created_at: string;
  created_by?: string;
}

export const useMandateNotes = (mandateId: string) => {
  const [notes, setNotes] = useState<MandateNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchNotes = async () => {
    if (!mandateId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('mandate_notes')
        .select('*')
        .eq('mandate_id', mandateId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setNotes(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar las notas';
      setError(errorMessage);
      console.error('Error fetching mandate notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (noteData: Omit<MandateNote, 'id' | 'created_at'>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user?.user?.id) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('mandate_notes')
        .insert({
          ...noteData,
          created_by: user.user.id
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setNotes(prev => [data, ...prev]);
      
      toast({
        title: "Nota agregada",
        description: "La nota ha sido guardada correctamente.",
      });

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la nota';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error creating mandate note:', err);
      return { data: null, error: errorMessage };
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('mandate_notes')
        .delete()
        .eq('id', noteId);

      if (error) {
        throw error;
      }

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
      console.error('Error deleting mandate note:', err);
      return { error: errorMessage };
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [mandateId]);

  return {
    notes,
    loading,
    error,
    createNote,
    deleteNote,
    refetch: fetchNotes
  };
};