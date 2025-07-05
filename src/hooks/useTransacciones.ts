import { useState, useEffect } from 'react';
import { Transaccion } from '@/types/Transaccion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useTransacciones = (pipelineId?: string) => {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTransacciones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('transacciones')
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
      
      const transformedData = (data || []).map(transaccion => ({
        id: transaccion.id,
        nombre_transaccion: transaccion.nombre_transaccion,
        company_id: transaccion.company_id,
        contact_id: transaccion.contact_id,
        valor_transaccion: transaccion.valor_transaccion,
        moneda: transaccion.moneda || 'EUR',
        tipo_transaccion: transaccion.tipo_transaccion,
        stage_id: transaccion.stage_id,
        prioridad: transaccion.prioridad,
        propietario_transaccion: transaccion.propietario_transaccion,
        ebitda: transaccion.ebitda,
        ingresos: transaccion.ingresos,
        multiplicador: transaccion.multiplicador,
        sector: transaccion.sector,
        ubicacion: transaccion.ubicacion,
        empleados: transaccion.empleados,
        descripcion: transaccion.descripcion,
        fuente_lead: transaccion.fuente_lead,
        proxima_actividad: transaccion.proxima_actividad,
        notas: transaccion.notas,
        created_by: transaccion.created_by,
        created_at: transaccion.created_at,
        updated_at: transaccion.updated_at,
        fecha_cierre: transaccion.fecha_cierre,
        is_active: transaccion.is_active,
        stage: transaccion.stages ? {
          id: transaccion.stages.id,
          name: transaccion.stages.name,
          color: transaccion.stages.color,
          order_index: transaccion.stages.order_index
        } : undefined,
        company: transaccion.companies ? {
          id: transaccion.companies.id,
          name: transaccion.companies.name,
          industry: transaccion.companies.industry,
          website: transaccion.companies.website
        } : undefined,
        contact: transaccion.contacts ? {
          id: transaccion.contacts.id,
          name: transaccion.contacts.name,
          email: transaccion.contacts.email,
          phone: transaccion.contacts.phone,
          position: transaccion.contacts.position
        } : undefined
      }));
      
      setTransacciones(transformedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar las transacciones';
      setError(errorMessage);
      console.error('Error fetching transacciones:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTransaccion = async (transaccionData: Omit<Transaccion, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('transacciones')
        .insert([{
          nombre_transaccion: transaccionData.nombre_transaccion,
          valor_transaccion: transaccionData.valor_transaccion,
          moneda: transaccionData.moneda,
          tipo_transaccion: transaccionData.tipo_transaccion,
          stage_id: transaccionData.stage_id,
          prioridad: transaccionData.prioridad,
          propietario_transaccion: transaccionData.propietario_transaccion,
          ebitda: transaccionData.ebitda,
          ingresos: transaccionData.ingresos,
          multiplicador: transaccionData.multiplicador,
          sector: transaccionData.sector,
          ubicacion: transaccionData.ubicacion,
          empleados: transaccionData.empleados,
          descripcion: transaccionData.descripcion,
          fuente_lead: transaccionData.fuente_lead,
          proxima_actividad: transaccionData.proxima_actividad,
          notas: transaccionData.notas,
          contact_id: transaccionData.contact_id,
          company_id: transaccionData.company_id,
          fecha_cierre: transaccionData.fecha_cierre,
          created_by: user?.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchTransacciones();
      toast({
        title: "Transacción creada",
        description: `${transaccionData.nombre_transaccion} ha sido creada correctamente.`,
      });
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la transacción';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error creating transaccion:', err);
      return { data: null, error: errorMessage };
    }
  };

  const updateTransaccion = async (id: string, updates: Partial<Transaccion>) => {
    try {
      const transaccionUpdates = {
        nombre_transaccion: updates.nombre_transaccion,
        valor_transaccion: updates.valor_transaccion,
        moneda: updates.moneda,
        tipo_transaccion: updates.tipo_transaccion,
        stage_id: updates.stage_id,
        prioridad: updates.prioridad,
        propietario_transaccion: updates.propietario_transaccion,
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
      Object.keys(transaccionUpdates).forEach(key => 
        transaccionUpdates[key] === undefined && delete transaccionUpdates[key]
      );
      
      const { data, error } = await supabase
        .from('transacciones')
        .update(transaccionUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchTransacciones();
      toast({
        title: "Transacción actualizada",
        description: "Los cambios han sido guardados correctamente.",
      });
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar la transacción';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error updating transaccion:', err);
      return { data: null, error: errorMessage };
    }
  };

  const updateTransaccionStage = async (transaccionId: string, stageId: string) => {
    return updateTransaccion(transaccionId, { stage_id: stageId });
  };

  const deleteTransaccion = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transacciones')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      await fetchTransacciones();
      toast({
        title: "Transacción eliminada",
        description: "La transacción ha sido eliminada correctamente.",
      });
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar la transacción';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error deleting transaccion:', err);
      return { error: errorMessage };
    }
  };

  useEffect(() => {
    fetchTransacciones();
  }, [pipelineId]);

  return {
    transacciones,
    loading,
    error,
    createTransaccion,
    updateTransaccion,
    updateTransaccionStage,
    deleteTransaccion,
    refetch: fetchTransacciones
  };
};