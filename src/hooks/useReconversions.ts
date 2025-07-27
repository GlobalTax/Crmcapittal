import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useReconversionSecurity } from '@/hooks/useReconversionSecurity';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Reconversion = Database['public']['Tables']['reconversiones_new']['Row'];

export function useReconversions() {
  const [reconversiones, setReconversiones] = useState<Reconversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { validateAction } = useReconversionSecurity();

  const fetchReconversiones = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('reconversiones_new')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setReconversiones(data || []);
    } catch (err) {
      console.error('Error fetching reconversiones:', err);
      setError(err as Error);
      toast.error('Error al cargar las reconversiones');
    } finally {
      setLoading(false);
    }
  };

  const createReconversion = async (data: Partial<Reconversion>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuario no autenticado');

      const validation = await validateAction({ action: 'create', data });
      if (!validation.valid) {
        toast.error('No tienes permisos para crear reconversiones');
        return null;
      }

      const reconversionData = {
        ...data,
        created_by: user.user.id,
        estado: data.estado || 'activa',
        subfase: data.subfase || 'prospecting',
        prioridad: data.prioridad || 'media',
        contact_name: data.contact_name || 'Sin nombre',
        rejection_reason: data.rejection_reason || 'Sin especificar',
        last_activity_at: new Date().toISOString()
      } as any;

      const { data: newReconversion, error } = await supabase
        .from('reconversiones_new')
        .insert(reconversionData)
        .select()
        .single();

      if (error) throw error;

      setReconversiones(prev => [newReconversion, ...prev]);
      toast.success('Reconversión creada exitosamente');
      return newReconversion;
    } catch (error) {
      console.error('Error creating reconversion:', error);
      toast.error('Error al crear la reconversión');
      return null;
    }
  };

  const updateReconversion = async (id: string, data: Partial<Reconversion>) => {
    try {
      const validation = await validateAction({ action: 'update', reconversionId: id, data });
      if (!validation.valid) {
        toast.error('No tienes permisos para actualizar esta reconversión');
        return null;
      }

      const { data: updatedReconversion, error } = await supabase
        .from('reconversiones_new')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setReconversiones(prev => 
        prev.map(r => r.id === id ? updatedReconversion : r)
      );
      toast.success('Reconversión actualizada exitosamente');
      return updatedReconversion;
    } catch (error) {
      console.error('Error updating reconversion:', error);
      toast.error('Error al actualizar la reconversión');
      return null;
    }
  };

  const deleteReconversion = async (id: string) => {
    try {
      const validation = await validateAction({ action: 'delete', reconversionId: id });
      if (!validation.valid) {
        toast.error('No tienes permisos para eliminar esta reconversión');
        return false;
      }

      const { error } = await supabase
        .from('reconversiones_new')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setReconversiones(prev => prev.filter(r => r.id !== id));
      toast.success('Reconversión eliminada exitosamente');
      return true;
    } catch (error) {
      console.error('Error deleting reconversion:', error);
      toast.error('Error al eliminar la reconversión');
      return false;
    }
  };

  useEffect(() => {
    fetchReconversiones();
  }, []);

  return {
    reconversiones,
    loading,
    error,
    fetchReconversiones,
    createReconversion,
    updateReconversion,
    deleteReconversion
  };
}