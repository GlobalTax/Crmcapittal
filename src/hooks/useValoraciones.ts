import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  const {
    data: valoraciones = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: [`valoraciones_cache_bust_${Date.now()}`], // EXTREME cache busting
    queryFn: async () => {
      console.log('🔥 EXTREME CACHE BUST - Fetching valoraciones with timestamp:', Date.now());
      
      const { data, error } = await supabase
        .from('valoraciones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ CACHE BUST - Error fetching valoraciones:', error);
        console.error('❌ CACHE BUST - Error details:', JSON.stringify(error, null, 2));
        throw error;
      }
      
      console.log('✅ CACHE BUST - Successfully fetched valoraciones:', data?.length || 0);
      return data as Valoracion[];
    },
    retry: 1,
    retryDelay: 500,
    staleTime: 0, // Never use stale data
    gcTime: 0, // Don't cache at all
  });

  const createMutation = useMutation({
    mutationFn: async (valoracionData: CreateValoracionData) => {
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

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['valoraciones_v3'] });
      toast.success('Valoración creada exitosamente');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Error al crear valoración';
      console.error('Error creating valoracion:', error);
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateValoracionData> }) => {
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

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['valoraciones_v3'] });
      toast.success('Valoración actualizada exitosamente');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Error al actualizar valoración';
      console.error('Error updating valoracion:', error);
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
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

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['valoraciones_v3'] });
      toast.success('Valoración eliminada exitosamente');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Error al eliminar valoración';
      console.error('Error deleting valoracion:', error);
      toast.error(message);
    },
  });

  return {
    valoraciones,
    loading,
    error,
    createValoracion: createMutation.mutate,
    updateValoracion: (id: string, updates: Partial<CreateValoracionData>) => 
      updateMutation.mutate({ id, updates }),
    deleteValoracion: deleteMutation.mutate,
    refetch,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}