import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Campaign, CreateCampaignData } from '@/types/Campaign';

export const useCampaigns = () => {
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading, error, refetch } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('sent_at', { ascending: false });

      if (error) throw error;
      return data as Campaign[];
    },
  });

  const sendCampaignMutation = useMutation({
    mutationFn: async (campaignData: CreateCampaignData) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No authenticated session');

      const { data, error } = await supabase.functions.invoke('send_campaign', {
        body: campaignData,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaña enviada exitosamente');
    },
    onError: (error) => {
      console.error('Error sending campaign:', error);
      toast.error('Error al enviar campaña');
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: CreateCampaignData) => {
      const { data, error } = await supabase
        .from('campaigns')
        .insert([campaignData])
        .select()
        .single();

      if (error) throw error;
      return data as Campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
    onError: (error) => {
      console.error('Error creating campaign:', error);
      toast.error('Error al crear campaña');
    },
  });

  return {
    campaigns: campaigns || [],
    isLoading,
    error,
    refetch,
    sendCampaign: sendCampaignMutation.mutate,
    isSending: sendCampaignMutation.isPending,
    createCampaign: createCampaignMutation.mutateAsync,
  };
};