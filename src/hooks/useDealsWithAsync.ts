
import { useState, useEffect } from 'react';
import { Deal } from '@/types/Deal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAsync } from '@/hooks/common';

export const useDealsWithAsync = (pipelineId?: string) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const { toast } = useToast();

  // Hook para operaciones de lectura con cache
  const fetchDealsAsync = useAsync<Deal[]>({
    onError: (error) => {
      console.error('Error fetching deals:', error);
    }
  });

  // Hook para operaciones de escritura
  const createDealAsync = useAsync<Deal>({
    onSuccess: (data) => {
      setDeals(prev => [data, ...prev]);
      toast({
        title: "Deal creado",
        description: `${data.deal_name} ha sido creado correctamente.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    },
    retryCount: 2,
    retryDelay: 1000
  });

  const updateDealAsync = useAsync<Deal>({
    onSuccess: () => {
      // Refetch deals after update
      fetchDealsAsync.execute(fetchDealsFunction);
      toast({
        title: "Deal actualizado",
        description: "Los cambios han sido guardados correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    },
    retryCount: 2,
    retryDelay: 1000
  });

  const deleteDealAsync = useAsync<void>({
    onSuccess: () => {
      fetchDealsAsync.execute(fetchDealsFunction);
      toast({
        title: "Deal eliminado",
        description: "El deal ha sido eliminado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  });

  const fetchDealsFunction = async (): Promise<Deal[]> => {
    let query = supabase
      .from('deals')
      .select(`
        *,
        stages!stage_id (
          id,
          name,
          color,
          order_index,
          pipeline_id
        ),
        contacts!contact_id (
          id,
          name,
          email,
          phone,
          company,
          position
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (pipelineId) {
      query = query.eq('stages.pipeline_id', pipelineId);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);
    
    const transformedData = (data || []).map(deal => ({
      ...deal,
      stage: deal.stages ? {
        id: deal.stages.id,
        name: deal.stages.name,
        color: deal.stages.color,
        order_index: deal.stages.order_index
      } : undefined,
      contact: deal.contacts ? {
        id: deal.contacts.id,
        name: deal.contacts.name,
        email: deal.contacts.email,
        phone: deal.contacts.phone,
        company: deal.contacts.company,
        position: deal.contacts.position
      } : undefined
    }));
    
    return transformedData;
  };

  const createDeal = async (dealData: Omit<Deal, 'id' | 'created_at' | 'updated_at'>) => {
    return createDealAsync.execute(async () => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('deals')
        .insert([{
          ...dealData,
          created_by: user?.user?.id
        }])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    });
  };

  const updateDeal = async (id: string, updates: Partial<Deal>) => {
    return updateDealAsync.execute(async () => {
      const { data, error } = await supabase
        .from('deals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    });
  };

  const updateDealStage = async (dealId: string, stageId: string) => {
    return updateDeal(dealId, { stage_id: stageId });
  };

  const deleteDeal = async (id: string) => {
    return deleteDealAsync.execute(async () => {
      const { error } = await supabase
        .from('deals')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw new Error(error.message);
    });
  };

  useEffect(() => {
    fetchDealsAsync.execute(fetchDealsFunction).then((data) => {
      if (data) {
        setDeals(data);
      }
    });
  }, [pipelineId]);

  // Update deals when fetchDealsAsync.data changes
  useEffect(() => {
    if (fetchDealsAsync.data) {
      setDeals(fetchDealsAsync.data);
    }
  }, [fetchDealsAsync.data]);

  return {
    deals,
    loading: fetchDealsAsync.loading || createDealAsync.loading || updateDealAsync.loading || deleteDealAsync.loading,
    error: fetchDealsAsync.error || createDealAsync.error || updateDealAsync.error || deleteDealAsync.error,
    createDeal,
    updateDeal,
    updateDealStage,
    deleteDeal,
    refetch: () => fetchDealsAsync.execute(fetchDealsFunction)
  };
};
