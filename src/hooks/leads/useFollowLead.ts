import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FollowLeadData {
  leadId: string;
  isFollowed: boolean;
}

export const useFollowLead = () => {
  const queryClient = useQueryClient();
  
  const followMutation = useMutation({
    mutationFn: async ({ leadId, isFollowed }: FollowLeadData) => {
      const { data, error } = await supabase
        .from('leads')
        .update({ is_followed: isFollowed })
        .eq('id', leadId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      
      toast.success(
        variables.isFollowed 
          ? 'Lead marcado como seguido' 
          : 'Se dejó de seguir el lead'
      );
    },
    onError: () => {
      toast.error('Error al actualizar el seguimiento del lead');
    },
  });

  return {
    toggleFollow: followMutation.mutate,
    isUpdating: followMutation.isPending,
  };
};