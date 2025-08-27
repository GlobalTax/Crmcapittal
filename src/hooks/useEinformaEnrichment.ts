import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/utils/productionLogger';

interface EnrichCompanyParams {
  companyId: string;
  nif: string;
}

export const useEinformaEnrichment = () => {
  const queryClient = useQueryClient();

  const enrichCompanyMutation = useMutation({
    mutationFn: async ({ companyId, nif }: EnrichCompanyParams) => {
      const { data, error } = await supabase.functions.invoke('einforma-enrich-company', {
        body: { 
          nif: nif,
          companyId: companyId 
        }
      });

      if (error) {
        logger.error('Error enriching company via eInforma API', { error, nif, companyId });
        throw error;
      }

      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company-activities', variables.companyId] });
      
      if (data?.success) {
        toast.success('Empresa enriquecida con datos de eInforma exitosamente');
      } else {
        toast.warning(data?.message || 'No se pudieron obtener datos adicionales');
      }
    },
    onError: (error) => {
      logger.error('eInforma enrichment mutation failed', { error });
      toast.error('Error al enriquecer los datos de la empresa');
    },
  });

  return {
    enrichCompany: enrichCompanyMutation.mutate,
    isEnriching: enrichCompanyMutation.isPending,
    error: enrichCompanyMutation.error,
  };
};