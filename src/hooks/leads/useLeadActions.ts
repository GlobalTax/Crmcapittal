import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useLeadActions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteLead = useMutation({
    mutationFn: async (leadId: string) => {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) {
        console.error('Error deleting lead:', error);
        throw new Error('Error al eliminar lead');
      }

      return leadId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads-kanban'] });
      queryClient.invalidateQueries({ queryKey: ['lead-contacts'] });
      toast({
        title: "Lead eliminado",
        description: "El lead ha sido eliminado exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const convertToDeal = useMutation({
    mutationFn: async (leadId: string) => {
      // Update lead status to converted
      const { error } = await supabase
        .from('leads')
        .update({ 
          status: 'QUALIFIED',
          conversion_date: new Date().toISOString()
        })
        .eq('id', leadId);

      if (error) {
        console.error('Error converting lead:', error);
        throw new Error('Error al convertir lead');
      }

      return leadId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads-kanban'] });
      queryClient.invalidateQueries({ queryKey: ['lead-contacts'] });
      toast({
        title: "Lead convertido",
        description: "El lead ha sido convertido a oportunidad exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateLeadStage = useMutation({
    mutationFn: async ({ leadId, newStage }: { leadId: string; newStage: string }) => {
      const { error } = await supabase
        .from('leads')
        .update({ 
          stage: newStage,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId);

      if (error) {
        console.error('Error updating lead stage:', error);
        throw new Error('Error al actualizar etapa del lead');
      }

      return { leadId, newStage };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads-kanban'] });
      queryClient.invalidateQueries({ queryKey: ['lead-contacts'] });
      toast({
        title: "Etapa actualizada",
        description: "La etapa del lead ha sido actualizada exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    deleteLead: deleteLead.mutate,
    isDeleting: deleteLead.isPending,
    convertToDeal: convertToDeal.mutate,
    isConverting: convertToDeal.isPending,
    updateLeadStage: updateLeadStage.mutate,
    isUpdatingStage: updateLeadStage.isPending,
  };
};