import { useState, useEffect } from 'react';
import { Deal } from '@/types/Deal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDeal = (dealId: string) => {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDeal = async () => {
    if (!dealId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
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
        .eq('id', dealId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      
      if (data) {
        const transformedDeal: Deal = {
          id: data.id,
          title: data.nombre_negocio,
          amount: data.valor_negocio,
          stage: data.stages?.name || 'Lead',
          probability: data.stages?.name === 'Won' ? 100 : 
                      data.stages?.name === 'Lost' ? 0 :
                      data.stages?.name === 'In Progress' ? 50 : 25,
          companyId: data.company_id,
          ownerId: data.created_by,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          company: data.companies ? {
            id: data.companies.id,
            name: data.companies.name,
            industry: data.companies.industry,
            website: data.companies.website
          } : undefined
        };
        
        setDeal(transformedDeal);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar el deal';
      setError(errorMessage);
      console.error('Error fetching deal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDeal = async (dealId: string, updates: Partial<Deal>) => {
    try {
      // Transform updates back to database format
      const dbUpdates: any = {};
      
      if (updates.title) dbUpdates.nombre_negocio = updates.title;
      if (updates.amount !== undefined) dbUpdates.valor_negocio = updates.amount;
      if (updates.stage) {
        // Get stage ID
        const { data: stage } = await supabase
          .from('stages')
          .select('id')
          .eq('name', updates.stage)
          .single();
        
        if (stage) dbUpdates.stage_id = stage.id;
      }

      const { error } = await supabase
        .from('negocios')
        .update(dbUpdates)
        .eq('id', dealId);

      if (error) throw error;
      
      // Update local state
      if (deal) {
        setDeal({ ...deal, ...updates });
      }
      
      toast({
        title: "Deal updated",
        description: "Deal has been updated successfully.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar el deal';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error updating deal:', err);
    }
  };

  useEffect(() => {
    fetchDeal();
  }, [dealId]);

  return {
    deal,
    isLoading,
    error,
    updateDeal,
    refetch: fetchDeal
  };
};