
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
        id: deal.id,
        nombre_negocio: deal.deal_name,
        company_id: deal.company_name, // Using company_name as identifier for now
        contact_id: deal.contact_id,
        valor_negocio: deal.deal_value,
        moneda: deal.currency || 'EUR',
        tipo_negocio: deal.deal_type,
        stage_id: deal.stage_id,
        prioridad: deal.priority,
        propietario_negocio: deal.deal_owner,
        ebitda: deal.ebitda,
        ingresos: deal.revenue,
        multiplicador: deal.multiplier,
        sector: deal.sector,
        ubicacion: deal.location,
        empleados: deal.employees,
        descripcion: deal.description,
        fuente_lead: deal.lead_source,
        proxima_actividad: deal.next_activity,
        notas: deal.notes,
        created_by: deal.created_by,
        created_at: deal.created_at,
        updated_at: deal.updated_at,
        fecha_cierre: deal.close_date,
        is_active: deal.is_active,
        stage: deal.stages ? {
          id: deal.stages.id,
          name: deal.stages.name,
          color: deal.stages.color,
          order_index: deal.stages.order_index
        } : undefined,
        company: deal.company_name ? {
          id: deal.company_name,
          name: deal.company_name,
          industry: undefined,
          website: undefined
        } : undefined,
        contact: deal.contacts ? {
          id: deal.contacts.id,
          name: deal.contacts.name,
          email: deal.contacts.email,
          phone: deal.contacts.phone,
          position: deal.contacts.position
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
        .from('deals')
        .insert([{
          deal_name: negocioData.nombre_negocio,
          deal_value: negocioData.valor_negocio,
          currency: negocioData.moneda,
          deal_type: negocioData.tipo_negocio,
          stage_id: negocioData.stage_id,
          priority: negocioData.prioridad,
          deal_owner: negocioData.propietario_negocio,
          ebitda: negocioData.ebitda,
          revenue: negocioData.ingresos,
          multiplier: negocioData.multiplicador,
          sector: negocioData.sector,
          location: negocioData.ubicacion,
          employees: negocioData.empleados,
          description: negocioData.descripcion,
          lead_source: negocioData.fuente_lead,
          next_activity: negocioData.proxima_actividad,
          notes: negocioData.notas,
          contact_id: negocioData.contact_id,
          company_name: negocioData.company_id,
          close_date: negocioData.fecha_cierre,
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
      const dealUpdates = {
        deal_name: updates.nombre_negocio,
        deal_value: updates.valor_negocio,
        currency: updates.moneda,
        deal_type: updates.tipo_negocio,
        stage_id: updates.stage_id,
        priority: updates.prioridad,
        deal_owner: updates.propietario_negocio,
        ebitda: updates.ebitda,
        revenue: updates.ingresos,
        multiplier: updates.multiplicador,
        sector: updates.sector,
        location: updates.ubicacion,
        employees: updates.empleados,
        description: updates.descripcion,
        lead_source: updates.fuente_lead,
        next_activity: updates.proxima_actividad,
        notes: updates.notas,
        contact_id: updates.contact_id,
        company_name: updates.company_id,
        close_date: updates.fecha_cierre
      };
      
      // Remove undefined values
      Object.keys(dealUpdates).forEach(key => 
        dealUpdates[key] === undefined && delete dealUpdates[key]
      );
      
      const { data, error } = await supabase
        .from('deals')
        .update(dealUpdates)
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
        .from('deals')
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
