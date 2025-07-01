
import { useState, useEffect } from 'react';
import { Negocio } from '@/types/Negocio';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useNegocios = (pipelineId?: string) => {
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchNegocios = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('negocios')
        .select(`
          *,
          stages!stage_id (
            id,
            name,
            color,
            order_index,
            pipeline_id
          ),
          companies!company_id (
            id,
            name,
            industry,
            website
          ),
          contacts!contact_id (
            id,
            name,
            email,
            phone,
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
      
      const transformedData = (data || []).map(negocio => ({
        ...negocio,
        stage: negocio.stages ? {
          id: negocio.stages.id,
          name: negocio.stages.name,
          color: negocio.stages.color,
          order_index: negocio.stages.order_index
        } : undefined,
        company: negocio.companies ? {
          id: negocio.companies.id,
          name: negocio.companies.name,
          industry: negocio.companies.industry,
          website: negocio.companies.website
        } : undefined,
        contact: negocio.contacts ? {
          id: negocio.contacts.id,
          name: negocio.contacts.name,
          email: negocio.contacts.email,
          phone: negocio.contacts.phone,
          position: negocio.contacts.position
        } : undefined
      }));
      
      setNegocios(transformedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los negocios';
      setError(errorMessage);
      console.error('Error fetching negocios:', err);
    } finally {
      setLoading(false);
    }
  };

  const createNegocio = async (negocioData: Omit<Negocio, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('negocios')
        .insert([{
          ...negocioData,
          created_by: user?.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchNegocios();
      toast({
        title: "Negocio creado",
        description: `${negocioData.nombre_negocio} ha sido creado correctamente.`,
      });
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el negocio';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error creating negocio:', err);
      return { data: null, error: errorMessage };
    }
  };

  const updateNegocio = async (id: string, updates: Partial<Negocio>) => {
    try {
      const { data, error } = await supabase
        .from('negocios')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchNegocios();
      toast({
        title: "Negocio actualizado",
        description: "Los cambios han sido guardados correctamente.",
      });
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar el negocio';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error updating negocio:', err);
      return { data: null, error: errorMessage };
    }
  };

  const updateNegocioStage = async (negocioId: string, stageId: string) => {
    return updateNegocio(negocioId, { stage_id: stageId });
  };

  const deleteNegocio = async (id: string) => {
    try {
      const { error } = await supabase
        .from('negocios')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      await fetchNegocios();
      toast({
        title: "Negocio eliminado",
        description: "El negocio ha sido eliminado correctamente.",
      });
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar el negocio';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error deleting negocio:', err);
      return { error: errorMessage };
    }
  };

  useEffect(() => {
    fetchNegocios();
  }, [pipelineId]);

  return {
    negocios,
    loading,
    error,
    createNegocio,
    updateNegocio,
    updateNegocioStage,
    deleteNegocio,
    refetch: fetchNegocios
  };
};
