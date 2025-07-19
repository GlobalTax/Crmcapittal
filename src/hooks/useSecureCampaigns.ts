
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Campaign, CreateCampaignData } from '@/types/Campaign';
import { sanitizeAndValidate, validationSchemas } from '@/utils/validation';
import { secureLogger } from '@/utils/secureLogger';
import { securityMonitor, RateLimiter } from '@/utils/security';
import { useAuth } from '@/contexts/AuthContext';

// Rate limiter para operaciones de campaña
const campaignRateLimiter = new RateLimiter();

export const useSecureCampaigns = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: campaigns, isLoading, error, refetch } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      // Rate limiting
      if (!campaignRateLimiter.isAllowed(user?.id || 'anonymous', 10, 60000)) {
        throw new Error('Demasiadas solicitudes. Inténtalo más tarde.');
      }

      securityMonitor.recordEvent('campaign_list_request', {
        userId: user?.id,
        timestamp: new Date().toISOString()
      });

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('sent_at', { ascending: false });

      if (error) {
        secureLogger.error('Error fetching campaigns', { userId: user?.id }, error);
        throw error;
      }

      secureLogger.info('Campaigns fetched successfully', {
        userId: user?.id,
        count: data?.length || 0
      });

      return data as Campaign[];
    },
  });

  const sendCampaignMutation = useMutation({
    mutationFn: async (campaignData: CreateCampaignData) => {
      // Rate limiting para envío de campañas
      if (!campaignRateLimiter.isAllowed(user?.id || 'anonymous', 5, 300000)) {
        throw new Error('Límite de envío de campañas alcanzado. Espera 5 minutos.');
      }

      // Validar y sanitizar datos
      const { valid, data: sanitizedData, errors } = sanitizeAndValidate(campaignData);

      if (!valid) {
        const errorMessage = `Datos de campaña inválidos: ${errors?.join(', ')}`;
        secureLogger.security('invalid_campaign_data', 'medium', {
          userId: user?.id,
          errors,
          originalData: campaignData
        });
        throw new Error(errorMessage);
      }

      securityMonitor.recordEvent('campaign_send_attempt', {
        userId: user?.id,
        audience: sanitizedData?.audience,
        opportunityCount: sanitizedData?.opportunity_ids?.length || 0
      });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        secureLogger.security('unauthorized_campaign_send', 'high', {
          userId: user?.id
        });
        throw new Error('Sesión no válida');
      }

      const { data, error } = await supabase.functions.invoke('send_campaign', {
        body: sanitizedData,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        secureLogger.error('Campaign send failed', {
          userId: user?.id,
          error: error.message
        }, error);
        throw error;
      }

      secureLogger.info('Campaign sent successfully', {
        userId: user?.id,
        campaignId: data?.campaign_id,
        recipientCount: data?.recipients_count
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaña enviada exitosamente');
    },
    onError: (error) => {
      secureLogger.error('Campaign send error', { userId: user?.id }, error);
      toast.error(error.message || 'Error al enviar campaña');
      
      securityMonitor.recordEvent('campaign_send_error', {
        userId: user?.id,
        error: error.message
      });
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: CreateCampaignData) => {
      // Validar y sanitizar datos
      const { valid, data: sanitizedData, errors } = sanitizeAndValidate(campaignData);

      if (!valid) {
        secureLogger.security('invalid_campaign_creation_data', 'medium', {
          userId: user?.id,
          errors
        });
        throw new Error(`Datos inválidos: ${errors?.join(', ')}`);
      }

      const { data, error } = await supabase
        .from('campaigns')
        .insert([sanitizedData])
        .select()
        .single();

      if (error) {
        secureLogger.error('Campaign creation failed', { userId: user?.id }, error);
        throw error;
      }

      secureLogger.info('Campaign created successfully', {
        userId: user?.id,
        campaignId: data.id
      });

      return data as Campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
    onError: (error) => {
      secureLogger.error('Campaign creation error', { userId: user?.id }, error);
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
