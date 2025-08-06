import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { leadInteractionsService } from '@/services/leadInteractionsService';
import { CreateLeadInteractionData, UpdateLeadInteractionData } from '@/types/LeadInteraction';

export const useLeadInteractions = (leadId: string) => {
  const queryClient = useQueryClient();

  // Query para obtener todas las interacciones de un lead
  const {
    data: interactions = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['lead_interactions', leadId],
    queryFn: () => leadInteractionsService.getLeadInteractions(leadId),
    enabled: !!leadId,
  });

  // Mutation para crear una nueva interacción
  const createMutation = useMutation({
    mutationFn: (data: CreateLeadInteractionData) => leadInteractionsService.createInteraction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead_interactions', leadId] });
      toast.success('Interacción creada exitosamente');
    },
    onError: (error) => {
      console.error('Error creating interaction:', error);
      toast.error('Error al crear la interacción');
    },
  });

  // Mutation para actualizar una interacción
  const updateMutation = useMutation({
    mutationFn: (data: UpdateLeadInteractionData) => leadInteractionsService.updateInteraction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead_interactions', leadId] });
      toast.success('Interacción actualizada exitosamente');
    },
    onError: (error) => {
      console.error('Error updating interaction:', error);
      toast.error('Error al actualizar la interacción');
    },
  });

  // Mutation para eliminar una interacción
  const deleteMutation = useMutation({
    mutationFn: (id: string) => leadInteractionsService.deleteInteraction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead_interactions', leadId] });
      toast.success('Interacción eliminada exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting interaction:', error);
      toast.error('Error al eliminar la interacción');
    },
  });

  return {
    interactions,
    isLoading,
    error,
    refetch,
    createInteraction: createMutation.mutate,
    updateInteraction: updateMutation.mutate,
    deleteInteraction: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};