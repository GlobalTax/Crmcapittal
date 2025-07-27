import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Reconversion = Database['public']['Tables']['reconversiones']['Row'];
type CreateReconversionData = Database['public']['Tables']['reconversiones']['Insert'];

export function useReconversiones() {
  const [reconversiones, setReconversiones] = useState<Reconversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReconversiones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('reconversiones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReconversiones(data || []);
    } catch (err) {
      console.error('Error fetching reconversiones:', err);
      setError(err as Error);
      toast.error('Error al cargar reconversiones');
    } finally {
      setLoading(false);
    }
  }, []);

  const createReconversion = useCallback(async (reconversionData: CreateReconversionData) => {
    try {
      const { data, error } = await supabase
        .from('reconversiones')
        .insert(reconversionData)
        .select()
        .single();

      if (error) throw error;
      
      setReconversiones(prev => [data, ...prev]);
      toast.success('Reconversión creada exitosamente');
      return data;
    } catch (err) {
      console.error('Error creating reconversion:', err);
      setError(err as Error);
      toast.error('Error al crear reconversión');
      throw err;
    }
  }, []);

  const updateReconversion = useCallback(async (id: string, updates: Partial<CreateReconversionData>) => {
    try {
      const { data, error } = await supabase
        .from('reconversiones')
        .update(updates)
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
      console.error('Error updating reconversion:', err);
      setError(err as Error);
      toast.error('Error al actualizar reconversión');
      throw err;
    }
  }, []);

  const deleteReconversion = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('reconversiones')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setReconversiones(prev => prev.filter(r => r.id !== id));
      toast.success('Reconversión eliminada exitosamente');
    } catch (err) {
      console.error('Error deleting reconversion:', err);
      setError(err as Error);
      toast.error('Error al eliminar reconversión');
      throw err;
    }
  }, []);

  const assignReconversion = useCallback(async (id: string, assignedTo: string) => {
    try {
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
      console.error('Error assigning reconversion:', err);
      setError(err as Error);
      toast.error('Error al asignar reconversión');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchReconversiones();
  }, [fetchReconversiones]);

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