
import { useState, useEffect } from 'react';
import { Negocio } from '@/types/Negocio';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AutomationService } from '@/services/automationService';

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
          contacts!contact_id (
            id,
            name,
            email,
            phone,
            position
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

      if (pipelineId) {
        query = query.eq('stages.pipeline_id', pipelineId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const transformedData = (data || []).map(negocio => ({
        id: negocio.id,
        nombre_negocio: negocio.nombre_negocio,
        company_id: negocio.company_id,
        contact_id: negocio.contact_id,
        valor_negocio: negocio.valor_negocio,
        moneda: negocio.moneda || 'EUR',
        tipo_negocio: negocio.tipo_negocio,
        stage_id: negocio.stage_id,
        prioridad: negocio.prioridad,
        propietario_negocio: negocio.propietario_negocio,
        ebitda: negocio.ebitda,
        ingresos: negocio.ingresos,
        multiplicador: negocio.multiplicador,
        sector: negocio.sector,
        ubicacion: negocio.ubicacion,
        empleados: negocio.empleados,
        descripcion: negocio.descripcion,
        fuente_lead: negocio.fuente_lead,
        proxima_actividad: negocio.proxima_actividad,
        notas: negocio.notas,
        created_by: negocio.created_by,
        created_at: negocio.created_at,
        updated_at: negocio.updated_at,
        fecha_cierre: negocio.fecha_cierre,
        is_active: negocio.is_active,
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
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.error('Error fetching negocios:', err);
      }
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
          nombre_negocio: negocioData.nombre_negocio,
          valor_negocio: negocioData.valor_negocio,
          moneda: negocioData.moneda,
          tipo_negocio: negocioData.tipo_negocio,
          stage_id: negocioData.stage_id,
          prioridad: negocioData.prioridad,
          propietario_negocio: negocioData.propietario_negocio,
          ebitda: negocioData.ebitda,
          ingresos: negocioData.ingresos,
          multiplicador: negocioData.multiplicador,
          sector: negocioData.sector,
          ubicacion: negocioData.ubicacion,
          empleados: negocioData.empleados,
          descripcion: negocioData.descripcion,
          fuente_lead: negocioData.fuente_lead,
          proxima_actividad: negocioData.proxima_actividad,
          notas: negocioData.notas,
          contact_id: negocioData.contact_id,
          company_id: negocioData.company_id,
          fecha_cierre: negocioData.fecha_cierre,
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
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.error('Error creating negocio:', err);
      }
      return { data: null, error: errorMessage };
    }
  };

  const updateNegocio = async (id: string, updates: Partial<Negocio>) => {
    try {
      // Get current negocio for stage change detection
      const currentNegocio = negocios.find(n => n.id === id);
      
      const negocioUpdates = {
        nombre_negocio: updates.nombre_negocio,
        valor_negocio: updates.valor_negocio,
        moneda: updates.moneda,
        tipo_negocio: updates.tipo_negocio,
        stage_id: updates.stage_id,
        prioridad: updates.prioridad,
        propietario_negocio: updates.propietario_negocio,
        ebitda: updates.ebitda,
        ingresos: updates.ingresos,
        multiplicador: updates.multiplicador,
        sector: updates.sector,
        ubicacion: updates.ubicacion,
        empleados: updates.empleados,
        descripcion: updates.descripcion,
        fuente_lead: updates.fuente_lead,
        proxima_actividad: updates.proxima_actividad,
        notas: updates.notas,
        contact_id: updates.contact_id,
        company_id: updates.company_id,
        fecha_cierre: updates.fecha_cierre
      };
      
      // Remove undefined values
      Object.keys(negocioUpdates).forEach(key => 
        negocioUpdates[key] === undefined && delete negocioUpdates[key]
      );
      
      const { data, error } = await supabase
        .from('negocios')
        .update(negocioUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Trigger automation if stage changed
      if (currentNegocio && updates.stage_id && currentNegocio.stage_id !== updates.stage_id) {
        try {
          await AutomationService.onDealStageUpdate(
            currentNegocio.stage?.name || '',
            updates.stage?.name || '',
            id,
            'negocio'
          );
        } catch (automationError) {
          console.error('Error triggering automation:', automationError);
          // Don't fail the update if automation fails
        }
      }
      
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
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.error('Error updating negocio:', err);
      }
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
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.error('Error deleting negocio:', err);
      }
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
