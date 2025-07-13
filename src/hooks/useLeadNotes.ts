import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LeadNote {
  id: string;
  lead_id: string;
  note: string;
  note_type: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadNoteData {
  lead_id: string;
  note: string;
  note_type?: string;
}

export interface UpdateLeadNoteData {
  note?: string;
  note_type?: string;
}

export const useLeadNotes = (leadId: string) => {
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading, error, refetch } = useQuery({
    queryKey: ['lead-notes', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_notes')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LeadNote[];
    },
    enabled: !!leadId,
  });

  const createNote = useMutation({
    mutationFn: async (noteData: CreateLeadNoteData) => {
      const { data, error } = await supabase
        .from('lead_notes')
        .insert([{ ...noteData, created_by: (await supabase.auth.getUser()).data.user?.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-notes', leadId] });
      toast.success('Nota creada exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error al crear la nota: ${error.message}`);
    },
  });

  const updateNote = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateLeadNoteData }) => {
      const { data, error } = await supabase
        .from('lead_notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-notes', leadId] });
      toast.success('Nota actualizada exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error al actualizar la nota: ${error.message}`);
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from('lead_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-notes', leadId] });
      toast.success('Nota eliminada exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error al eliminar la nota: ${error.message}`);
    },
  });

  return {
    notes,
    isLoading,
    error,
    refetch,
    createNote: createNote.mutate,
    updateNote: updateNote.mutate,
    deleteNote: deleteNote.mutate,
    isCreating: createNote.isPending,
    isUpdating: updateNote.isPending,
    isDeleting: deleteNote.isPending,
  };
};