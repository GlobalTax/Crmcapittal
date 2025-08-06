
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useLeadActions() {
  const queryClient = useQueryClient();

  // Delete lead mutation
  const deleteLeadMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead eliminado correctamente');
    },
    onError: (error) => {
      console.error('Error deleting lead:', error);
      toast.error('Error al eliminar el lead');
    },
  });

  // Convert to deal mutation
  const convertToDealMutation = useMutation({
    mutationFn: async (leadId: string) => {
      // TODO: Implement conversion logic to deals table
      const { error } = await supabase
        .from('leads')
        .update({ status: 'QUALIFIED' })
        .eq('id', leadId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead convertido a deal correctamente');
    },
    onError: (error) => {
      console.error('Error converting lead:', error);
      toast.error('Error al convertir el lead');
    },
  });

  return {
    deleteLead: deleteLeadMutation.mutate,
    isDeleting: deleteLeadMutation.isPending,
    convertToDeal: convertToDealMutation.mutate,
    isConverting: convertToDealMutation.isPending,
  };
}
