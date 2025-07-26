
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Valoracion = Database['public']['Tables']['valoraciones']['Row'];
type CreateValoracionData = Database['public']['Tables']['valoraciones']['Insert'];

// Función para sanitizar inputs
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
}

// Función para validar con edge function (simplificada)
const validateWithBackend = async (action: string, data: any, valoracionId?: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No autorizado');

    // Validación básica local (sin llamada al backend por ahora)
    if (action === 'create' && (!data.company_name || !data.client_name)) {
      throw new Error('Nombre de empresa y cliente son obligatorios');
    }

    return true;
  } catch (error) {
    console.error('Error en validación:', error);
    throw error;
  }
};

export function useValoraciones() {
  const [valoraciones, setValoraciones] = useState<Valoracion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchValoraciones = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching valoraciones with correct query...');
      
      const { data, error } = await supabase
        .from('valoraciones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching valoraciones:', error);
        throw error;
      }
      
      console.log('✅ Successfully fetched valoraciones:', data?.length || 0);
      setValoraciones(data || []);
    } catch (err) {
      console.error('❌ Error in fetchValoraciones:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createValoracion = async (valoracionData: CreateValoracionData) => {
    try {
      setLoading(true);
      setError(null);

      // Sanitizar datos de entrada
      const sanitizedData = {
        ...valoracionData,
        company_name: valoracionData.company_name ? sanitizeInput(valoracionData.company_name) : '',
        client_name: valoracionData.client_name ? sanitizeInput(valoracionData.client_name) : '',
        company_description: valoracionData.company_description ? sanitizeInput(valoracionData.company_description) : undefined,
      };

      // Validar con backend antes de proceder
      await validateWithBackend('create', sanitizedData);

      const { data, error } = await supabase
        .from('valoraciones')
        .insert([sanitizedData])
        .select()
        .single();

      if (error) {
        // Manejo específico de errores de validación
        if (error.message.includes('Asociación inválida')) {
          throw new Error('Error: La empresa o contacto seleccionado no es válido o no está activo');
        }
        if (error.message.includes('requerido')) {
          throw new Error('Error: Faltan campos obligatorios');
        }
        throw error;
      }

      setValoraciones(prev => [data, ...prev]);
      toast.success('Valoración creada exitosamente');
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear valoración';
      setError(err as Error);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateValoracion = async (id: string, updates: Partial<CreateValoracionData>) => {
    try {
      setLoading(true);
      setError(null);

      // Sanitizar datos de actualización
      const sanitizedUpdates = { ...updates };
      if (updates.company_name) {
        sanitizedUpdates.company_name = sanitizeInput(updates.company_name);
      }
      if (updates.client_name) {
        sanitizedUpdates.client_name = sanitizeInput(updates.client_name);
      }
      if (updates.company_description) {
        sanitizedUpdates.company_description = sanitizeInput(updates.company_description);
      }

      // Validar con backend si es cambio de asociación
      const hasAssociationChange = Object.keys(updates).some(key => 
        key === 'company_id' || key === 'contact_id'
      );
      
      if (hasAssociationChange) {
        await validateWithBackend('association_change', sanitizedUpdates, id);
      } else {
        await validateWithBackend('update', sanitizedUpdates, id);
      }

      const { data, error } = await supabase
        .from('valoraciones')
        .update(sanitizedUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        // Manejo específico de errores de validación
        if (error.message.includes('Asociación inválida')) {
          throw new Error('Error: La empresa o contacto seleccionado no es válido o no está correctamente relacionado');
        }
        if (error.message.includes('permisos')) {
          throw new Error('Error: No tienes permisos para realizar esta acción');
        }
        throw error;
      }

      setValoraciones(prev => 
        prev.map(v => v.id === id ? { ...v, ...data } : v)
      );
      toast.success('Valoración actualizada exitosamente');
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar valoración';
      setError(err as Error);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteValoracion = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Validar con backend antes de eliminar
      await validateWithBackend('delete', {}, id);

      const { error } = await supabase
        .from('valoraciones')
        .delete()
        .eq('id', id);

      if (error) {
        if (error.message.includes('valoraciones activas')) {
          throw new Error('No se puede eliminar: Esta valoración tiene dependencias activas');
        }
        throw error;
      }

      setValoraciones(prev => prev.filter(v => v.id !== id));
      toast.success('Valoración eliminada exitosamente');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar valoración';
      setError(err as Error);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValoraciones();
  }, []);

  return {
    valoraciones,
    loading,
    error,
    createValoracion,
    updateValoracion,
    deleteValoracion,
    refetch: fetchValoraciones
  };
}
