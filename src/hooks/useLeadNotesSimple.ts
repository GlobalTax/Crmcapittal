import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export interface CreateLeadNoteData {
  lead_id: string;
  note: string;
  note_type?: string;
}

export const useLeadNotes = (leadId: string) => {
  const queryClient = useQueryClient();

  const {
    data: notes = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['lead_notes', leadId],
    queryFn: async () => {
      // For now, return empty array since the table might not be reflected in types yet
      return [] as LeadNote[];
    },
    enabled: !!leadId,
  });

  const createMutation = useMutation({
    mutationFn: async (noteData: CreateLeadNoteData) => {
      // Placeholder - will be implemented once types are updated
      return {} as LeadNote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead_notes', leadId] });
      toast.success('Nota creada exitosamente');
    },
    onError: (error) => {
      console.error('Error creating note:', error);
      toast.error('Error al crear la nota');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<LeadNote> }) => {
      // Placeholder - will be implemented once types are updated
      return {} as LeadNote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead_notes', leadId] });
      toast.success('Nota actualizada exitosamente');
    },
    onError: (error) => {
      console.error('Error updating note:', error);
      toast.error('Error al actualizar la nota');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Placeholder - will be implemented once types are updated
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead_notes', leadId] });
      toast.success('Nota eliminada exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting note:', error);
      toast.error('Error al eliminar la nota');
    },
  });

  return {
    notes,
    isLoading,
    error,
    refetch,
    createNote: createMutation.mutate,
    updateNote: updateMutation.mutate,
    deleteNote: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};