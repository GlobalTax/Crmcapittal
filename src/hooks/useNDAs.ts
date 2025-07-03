
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NDA, CreateNDAData } from '@/types/Transaction';
import { useToast } from '@/hooks/use-toast';

export const useNDAs = (transactionId?: string) => {
  const [ndas, setNdas] = useState<NDA[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchNDAs = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('ndas')
        .select('*')
        .order('created_at', { ascending: false });

      if (transactionId) {
        query = query.eq('transaction_id', transactionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setNdas((data || []) as NDA[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar NDAs';
      setError(errorMessage);
      console.error('Error fetching NDAs:', err);
    } finally {
      setLoading(false);
    }
  };

  const createNDA = async (data: CreateNDAData) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data: newNDA, error } = await supabase
        .from('ndas')
        .insert([{
          ...data,
          created_by: user?.user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      setNdas(prev => [newNDA as NDA, ...prev]);
      toast({
        title: "NDA creado",
        description: "El acuerdo de confidencialidad ha sido creado correctamente.",
      });
      return newNDA as NDA;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear NDA';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateNDA = async (id: string, updates: Partial<NDA>) => {
    try {
      const { data: updatedNDA, error } = await supabase
        .from('ndas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setNdas(prev => 
        prev.map(nda => nda.id === id ? updatedNDA as NDA : nda)
      );
      toast({
        title: "NDA actualizado",
        description: "Los cambios han sido guardados correctamente.",
      });
      return updatedNDA as NDA;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar NDA';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const markAsSigned = async (id: string, signedBy: 'client' | 'advisor') => {
    const updates = signedBy === 'client' 
      ? { signed_by_client: true, signed_at: new Date().toISOString() }
      : { signed_by_advisor: true };
    
    return await updateNDA(id, updates);
  };

  useEffect(() => {
    fetchNDAs();
  }, [transactionId]);

  return {
    ndas,
    loading,
    error,
    createNDA,
    updateNDA,
    markAsSigned,
    refetch: fetchNDAs
  };
};
