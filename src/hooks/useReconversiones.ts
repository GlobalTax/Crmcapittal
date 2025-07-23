import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useReconversionSecurity } from '@/hooks/useReconversionSecurity';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Reconversion = Database['public']['Tables']['reconversiones']['Row'];
type CreateReconversionData = Database['public']['Tables']['reconversiones']['Insert'];

export function useReconversiones() {
  const [reconversiones, setReconversiones] = useState<Reconversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { validateAction } = useReconversionSecurity();

  const fetchReconversiones = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reconversiones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReconversiones(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createReconversion = async (reconversionData: CreateReconversionData) => {
    try {
      // Validar datos antes de crear
      const validation = await validateAction({
        action: 'create',
        data: reconversionData
      });

      if (!validation.valid) {
        toast.error('Datos inválidos: ' + validation.errors.join(', '));
        throw new Error(validation.errors.join(', '));
      }

      // Sanitizar datos usando la función de la base de datos
      const { data: sanitizedData } = await supabase
        .rpc('sanitize_reconversion_data', { p_data: reconversionData });

      const finalData = sanitizedData || reconversionData;

      const { data, error } = await supabase
        .from('reconversiones')
        .insert(finalData as any)
        .select()
        .single();

      if (error) throw error;
      
      setReconversiones(prev => [data, ...prev]);
      toast.success('Reconversión creada exitosamente');
      return data;
    } catch (err) {
      setError(err as Error);
      toast.error('Error al crear reconversión');
      throw err;
    }
  };

  const updateReconversion = async (id: string, updates: Partial<CreateReconversionData>) => {
    try {
      // Validar datos antes de actualizar
      const validation = await validateAction({
        action: 'update',
        reconversionId: id,
        data: updates
      });

      if (!validation.valid) {
        toast.error('Datos inválidos: ' + validation.errors.join(', '));
        throw new Error(validation.errors.join(', '));
      }

      // Sanitizar datos
      const { data: sanitizedData } = await supabase
        .rpc('sanitize_reconversion_data', { p_data: updates });

      const finalUpdates = sanitizedData || updates;

      const { data, error } = await supabase
        .from('reconversiones')
        .update(finalUpdates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setReconversiones(prev => 
        prev.map(r => r.id === id ? { ...r, ...data } : r)
      );
      
      toast.success('Reconversión actualizada exitosamente');
      return data;
    } catch (err) {
      setError(err as Error);
      toast.error('Error al actualizar reconversión');
      throw err;
    }
  };

  const deleteReconversion = async (id: string) => {
    try {
      // Validar permisos de eliminación
      const validation = await validateAction({
        action: 'delete',
        reconversionId: id
      });

      if (!validation.valid) {
        toast.error('Sin permisos: ' + validation.errors.join(', '));
        throw new Error(validation.errors.join(', '));
      }

      const { error } = await supabase
        .from('reconversiones')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setReconversiones(prev => prev.filter(r => r.id !== id));
      toast.success('Reconversión eliminada exitosamente');
    } catch (err) {
      setError(err as Error);
      toast.error('Error al eliminar reconversión');
      throw err;
    }
  };

  const assignReconversion = async (id: string, assignedTo: string) => {
    try {
      // Validar cambio de asignación
      const validation = await validateAction({
        action: 'assignment_change',
        reconversionId: id,
        data: { assigned_to: assignedTo }
      });

      if (!validation.valid) {
        toast.error('Error de asignación: ' + validation.errors.join(', '));
        throw new Error(validation.errors.join(', '));
      }

      const { data, error } = await supabase
        .from('reconversiones')
        .update({ assigned_to: assignedTo })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setReconversiones(prev => 
        prev.map(r => r.id === id ? { ...r, ...data } : r)
      );
      
      toast.success('Reconversión asignada exitosamente');
      return data;
    } catch (err) {
      setError(err as Error);
      toast.error('Error al asignar reconversión');
      throw err;
    }
  };

  useEffect(() => {
    fetchReconversiones();
  }, []);

  return {
    reconversiones,
    loading,
    error,
    createReconversion,
    updateReconversion,
    deleteReconversion,
    assignReconversion,
    refetch: fetchReconversiones
  };
}