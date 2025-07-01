
import { useState, useEffect } from 'react';
import { Deal } from '@/types/Deal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDeals = (pipelineId?: string) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
          phone: deal.contacts.phone,
          company: deal.contacts.company,
          position: deal.contacts.position
        } : undefined
      }));
      
      setDeals(transformedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los deals';
      setError(errorMessage);
      console.error('Error fetching deals:', err);
    } finally {
      setLoading(false);
    }
  };

  const createDeal = async (dealData: Omit<Deal, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('deals')
        .insert([{
          ...dealData,
          created_by: user?.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchDeals();
      toast({
        title: "Deal creado",
        description: `${dealData.deal_name} ha sido creado correctamente.`,
      });
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el deal';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error creating deal:', err);
      return { data: null, error: errorMessage };
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
      toast({
        title: "Deal actualizado",
        description: "Los cambios han sido guardados correctamente.",
      });
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar el deal';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error updating deal:', err);
      return { data: null, error: errorMessage };
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
      toast({
        title: "Deal eliminado",
        description: "El deal ha sido eliminado correctamente.",
      });
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar el deal';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error deleting deal:', err);
      return { error: errorMessage };
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
