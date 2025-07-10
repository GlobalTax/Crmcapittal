import { useState, useEffect } from 'react';
import { Deal, CreateDealData } from '@/types/Deal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDeals = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('negocios')
        .select(`
          *,
          stages!stage_id (
            id,
            name,
            color,
            order_index
          ),
          companies!company_id (
            id,
            name,
            industry,
            website
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedDeals = (data || []).map(negocio => ({
        id: negocio.id,
        title: negocio.nombre_negocio,
        amount: negocio.valor_negocio,
        stage: negocio.stages?.name || 'Lead',
        probability: negocio.stages?.name === 'Won' ? 100 : 
                    negocio.stages?.name === 'Lost' ? 0 :
                    negocio.stages?.name === 'In Progress' ? 50 : 25,
        companyId: negocio.company_id,
        ownerId: negocio.created_by,
        createdAt: negocio.created_at,
        updatedAt: negocio.updated_at,
        company: negocio.companies ? {
          id: negocio.companies.id,
          name: negocio.companies.name,
          industry: negocio.companies.industry,
          website: negocio.companies.website
        } : undefined
      }));
      
      setDeals(transformedDeals);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los deals';
      setError(errorMessage);
      console.error('Error fetching deals:', err);
    } finally {
      setLoading(false);
    }
  };

  const createDeal = async (dealData: CreateDealData) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      // Get stage ID for the selected stage
      const { data: stages } = await supabase
        .from('stages')
        .select('id')
        .eq('name', dealData.stage || 'Lead')
        .single();

      const { data, error } = await supabase
        .from('negocios')
        .insert([{
          nombre_negocio: dealData.title,
          valor_negocio: dealData.amount,
          moneda: 'EUR',
          tipo_negocio: 'venta',
          stage_id: stages?.id,
          prioridad: 'media',
          // Only include company_id if provided and not empty
          ...(dealData.companyId && { company_id: dealData.companyId }),
          created_by: dealData.ownerId || user?.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchDeals();
      toast({
        title: "Deal creado",
        description: `${dealData.title} ha sido creado correctamente.`,
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

  const updateDealStage = async (dealId: string, stageName: string) => {
    try {
      // Get stage ID
      const { data: stage } = await supabase
        .from('stages')
        .select('id')
        .eq('name', stageName)
        .single();

      if (!stage) throw new Error('Stage not found');

      const { error } = await supabase
        .from('negocios')
        .update({ stage_id: stage.id })
        .eq('id', dealId);

      if (error) throw error;
      
      await fetchDeals();
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar el deal';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error updating deal stage:', err);
      return { error: errorMessage };
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  return {
    deals,
    loading,
    error,
    createDeal,
    updateDealStage,
    refetch: fetchDeals
  };
};