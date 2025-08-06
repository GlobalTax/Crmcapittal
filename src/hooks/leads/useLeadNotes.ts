import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LeadNote {
  id: string;
  lead_id: string;
  note: string;
  note_type: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteData {
  lead_id: string;
  note: string;
  note_type?: string;
}

export const useLeadNotes = (leadId: string) => {
  const queryClient = useQueryClient();

  const notesQuery = useQuery({
    queryKey: ['lead-notes', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_notes')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching lead notes:', error);
        throw new Error('Error al cargar notas del lead');
      }

      return data as LeadNote[];
    },
    enabled: !!leadId,
  });

  const createNoteMutation = useMutation({
    mutationFn: async (noteData: CreateNoteData) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('lead_notes')
        .insert({
          ...noteData,
          created_by: userData.user?.id,
          note_type: noteData.note_type || 'general',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating note:', error);
        throw new Error('Error al crear nota');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-notes', leadId] });
      toast.success('Nota creada exitosamente');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    notes: notesQuery.data || [],
    isLoading: notesQuery.isLoading,
    error: notesQuery.error,
    createNote: createNoteMutation.mutate,
    isCreating: createNoteMutation.isPending,
  };
};