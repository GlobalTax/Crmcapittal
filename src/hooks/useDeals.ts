
import { useState, useEffect } from 'react';
import { Deal } from '@/types/Deal';
import { supabase } from '@/integrations/supabase/client';

export const useDeals = (pipelineId?: string) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError(null);
      
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
            mobile,
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

      if (error) throw error;
      
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
          phone: deal.contacts.phone || deal.contacts.mobile,
          company: deal.contacts.company,
          position: deal.contacts.position
        } : undefined
      }));
      
      setDeals(transformedData);
    } catch (err) {
      console.error('Error fetching deals:', err);
      setError('Error al cargar los deals');
    } finally {
      setLoading(false);
    }
  };

  const createDeal = async (dealData: Omit<Deal, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .insert([{
          ...dealData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchDeals();
      return { data, error: null };
    } catch (err) {
      console.error('Error creating deal:', err);
      return { data: null, error: 'Error al crear el deal' };
    }
  };

  const updateDeal = async (id: string, updates: Partial<Deal>) => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchDeals();
      return { data, error: null };
    } catch (err) {
      console.error('Error updating deal:', err);
      return { data: null, error: 'Error al actualizar el deal' };
    }
  };

  const updateDealStage = async (dealId: string, stageId: string) => {
    return updateDeal(dealId, { stage_id: stageId });
  };

  const deleteDeal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('deals')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      await fetchDeals();
      return { error: null };
    } catch (err) {
      console.error('Error deleting deal:', err);
      return { error: 'Error al eliminar el deal' };
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [pipelineId]);

  return {
    deals,
    loading,
    error,
    createDeal,
    updateDeal,
    updateDealStage,
    deleteDeal,
    refetch: fetchDeals
  };
};
