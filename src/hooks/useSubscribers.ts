import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Subscriber, CreateSubscriberData } from '@/types/Subscriber';

export const useSubscribers = () => {
  const queryClient = useQueryClient();

  const { data: subscribers, isLoading, error, refetch } = useQuery({
    queryKey: ['subscribers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Subscriber[];
    },
  });

  const createSubscriberMutation = useMutation({
    mutationFn: async (subscriberData: CreateSubscriberData) => {
      const { data, error } = await supabase
        .from('subscribers')
        .insert([subscriberData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      toast.success('Suscriptor creado exitosamente');
    },
    onError: (error) => {
      console.error('Error creating subscriber:', error);
      toast.error('Error al crear suscriptor');
    },
  });

  const updateSubscriberMutation = useMutation({
    mutationFn: async ({ id, ...subscriberData }: Partial<Subscriber> & { id: string }) => {
      const { data, error } = await supabase
        .from('subscribers')
        .update(subscriberData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      toast.success('Suscriptor actualizado exitosamente');
    },
    onError: (error) => {
      console.error('Error updating subscriber:', error);
      toast.error('Error al actualizar suscriptor');
    },
  });

  const deleteSubscriberMutation = useMutation({
    mutationFn: async (subscriberId: string) => {
      const { error } = await supabase
        .from('subscribers')
        .delete()
        .eq('id', subscriberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      toast.success('Suscriptor eliminado exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting subscriber:', error);
      toast.error('Error al eliminar suscriptor');
    },
  });

  const getDistinctSegments = async () => {
    const { data, error } = await supabase
      .from('subscribers')
      .select('segment')
      .not('segment', 'is', null);

    if (error) throw error;
    
    const segments = Array.from(new Set(data?.map(item => item.segment) || []));
    return segments.filter(Boolean);
  };

  return {
    subscribers: subscribers || [],
    isLoading,
    error,
    refetch,
    createSubscriber: createSubscriberMutation.mutate,
    updateSubscriber: updateSubscriberMutation.mutate,
    deleteSubscriber: deleteSubscriberMutation.mutate,
    isCreating: createSubscriberMutation.isPending,
    isUpdating: updateSubscriberMutation.isPending,
    isDeleting: deleteSubscriberMutation.isPending,
    getDistinctSegments,
  };
};