import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { WinbackSequence, WinbackStep } from '@/types/Winback';

export type { WinbackSequence, WinbackStep };

export const useWinbackSequences = () => {
  const [sequences, setSequences] = useState<WinbackSequence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSequences = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('winback_sequences')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSequences((data || []).map(seq => ({
        ...seq,
        pasos: Array.isArray(seq.pasos) ? seq.pasos : JSON.parse(seq.pasos as string || '[]')
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando secuencias');
      toast.error('Error cargando secuencias winback');
    } finally {
      setIsLoading(false);
    }
  };

  const createSequence = async (sequenceData: Omit<WinbackSequence, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('winback_sequences')
        .insert([sequenceData])
        .select()
        .single();

      if (error) throw error;
      
      const mappedData = {
        ...data,
        pasos: Array.isArray(data.pasos) ? data.pasos : JSON.parse(data.pasos as string || '[]')
      };
      setSequences(prev => [mappedData, ...prev]);
      toast.success('Secuencia winback creada exitosamente');
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error creando secuencia';
      toast.error(message);
      throw err;
    }
  };

  const updateSequence = async (id: string, updates: Partial<WinbackSequence>) => {
    try {
      const { data, error } = await supabase
        .from('winback_sequences')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const mappedData = {
        ...data,
        pasos: Array.isArray(data.pasos) ? data.pasos : JSON.parse(data.pasos as string || '[]')
      };
      setSequences(prev => prev.map(seq => seq.id === id ? mappedData : seq));
      toast.success('Secuencia actualizada exitosamente');
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error actualizando secuencia';
      toast.error(message);
      throw err;
    }
  };

  const deleteSequence = async (id: string) => {
    try {
      const { error } = await supabase
        .from('winback_sequences')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSequences(prev => prev.filter(seq => seq.id !== id));
      toast.success('Secuencia eliminada exitosamente');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error eliminando secuencia';
      toast.error(message);
      throw err;
    }
  };

  const toggleSequenceStatus = async (id: string, activo: boolean) => {
    await updateSequence(id, { activo });
  };

  useEffect(() => {
    fetchSequences();
  }, []);

  return {
    sequences,
    isLoading,
    error,
    createSequence,
    updateSequence,
    deleteSequence,
    toggleSequenceStatus,
    refetch: fetchSequences
  };
};