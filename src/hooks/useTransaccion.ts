import { useState, useEffect } from 'react';
import { Transaccion } from '@/types/Transaccion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useTransaccion = (transaccionId: string) => {
  const [transaccion, setTransaccion] = useState<Transaccion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTransaccion = async () => {
    if (!transaccionId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('transacciones')
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
          ),
          contacts!contact_id (
            id,
            name,
            email,
            phone,
            position,
            company
          )
        `)
        .eq('id', transaccionId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      
      if (data) {
        const transformedTransaccion: Transaccion = {
          id: data.id,
          nombre_transaccion: data.nombre_transaccion,
          company_id: data.company_id,
          contact_id: data.contact_id,
          valor_transaccion: data.valor_transaccion,
          moneda: data.moneda || 'EUR',
          tipo_transaccion: data.tipo_transaccion,
          stage_id: data.stage_id,
          prioridad: data.prioridad,
          propietario_transaccion: data.propietario_transaccion,
          ebitda: data.ebitda,
          ingresos: data.ingresos,
          multiplicador: data.multiplicador,
          sector: data.sector,
          ubicacion: data.ubicacion,
          empleados: data.empleados,
          descripcion: data.descripcion,
          fuente_lead: data.fuente_lead,
          proxima_actividad: data.proxima_actividad,
          notas: data.notas,
          created_by: data.created_by,
          created_at: data.created_at,
          updated_at: data.updated_at,
          fecha_cierre: data.fecha_cierre,
          is_active: data.is_active,
          stage: data.stages ? {
            id: data.stages.id,
            name: data.stages.name,
            color: data.stages.color,
            order_index: data.stages.order_index
          } : undefined,
          company: data.companies ? {
            id: data.companies.id,
            name: data.companies.name,
            industry: data.companies.industry,
            website: data.companies.website
          } : undefined,
          contact: data.contacts ? {
            id: data.contacts.id,
            name: data.contacts.name,
            email: data.contacts.email,
            phone: data.contacts.phone,
            position: data.contacts.position
          } : undefined
        };
        
        setTransaccion(transformedTransaccion);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar la transacción';
      setError(errorMessage);
      console.error('Error fetching transaccion:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTransaccion = async (transaccionId: string, updates: Partial<Transaccion>) => {
    try {
      // Transform updates back to database format
      const dbUpdates: any = {};
      
      if (updates.nombre_transaccion) dbUpdates.nombre_transaccion = updates.nombre_transaccion;
      if (updates.valor_transaccion !== undefined) dbUpdates.valor_transaccion = updates.valor_transaccion;
      if (updates.stage_id) dbUpdates.stage_id = updates.stage_id;
      if (updates.prioridad) dbUpdates.prioridad = updates.prioridad;
      if (updates.descripcion) dbUpdates.descripcion = updates.descripcion;
      if (updates.notas) dbUpdates.notas = updates.notas;

      const { error } = await supabase
        .from('transacciones')
        .update(dbUpdates)
        .eq('id', transaccionId);

      if (error) throw error;
      
      // Update local state
      if (transaccion) {
        setTransaccion({ ...transaccion, ...updates });
      }
      
      toast({
        title: "Transacción actualizada",
        description: "La transacción ha sido actualizada exitosamente.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar la transacción';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error updating transaccion:', err);
    }
  };

  useEffect(() => {
    fetchTransaccion();
  }, [transaccionId]);

  return {
    transaccion,
    isLoading,
    error,
    updateTransaccion,
    refetch: fetchTransaccion
  };
};