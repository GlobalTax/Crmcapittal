import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ContactHistoryEntry {
  id: string;
  target_id: string;
  mandate_id: string;
  fecha_contacto: string;
  medio: 'email' | 'telefono';
  resultado: 'pendiente' | 'positivo' | 'negativo';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useContactHistory = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createContactEntry = async (
    targetId: string,
    mandateId: string,
    medio: 'email' | 'telefono'
  ): Promise<ContactHistoryEntry | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_history')
        .insert({
          target_id: targetId,
          mandate_id: mandateId,
          medio,
          resultado: 'pendiente',
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Contacto registrado',
        description: `Se ha registrado el contacto por ${medio === 'email' ? 'email' : 'teléfono'}`,
      });

      return data as ContactHistoryEntry;
    } catch (error) {
      console.error('Error creating contact entry:', error);
      toast({
        title: 'Error',
        description: 'No se pudo registrar el contacto',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateContactResult = async (
    entryId: string,
    resultado: 'pendiente' | 'positivo' | 'negativo'
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('contact_history')
        .update({ resultado })
        .eq('id', entryId);

      if (error) throw error;

      toast({
        title: 'Resultado actualizado',
        description: `El resultado del contacto se ha actualizado a ${resultado}`,
      });

      return true;
    } catch (error) {
      console.error('Error updating contact result:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el resultado',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getContactHistory = async (targetId: string): Promise<ContactHistoryEntry[]> => {
    try {
      const { data, error } = await supabase
        .from('contact_history')
        .select('*')
        .eq('target_id', targetId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ContactHistoryEntry[];
    } catch (error) {
      console.error('Error fetching contact history:', error);
      return [];
    }
  };

  const hasContactEntry = async (targetId: string, medio: 'email' | 'telefono'): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('contact_history')
        .select('id')
        .eq('target_id', targetId)
        .eq('medio', medio)
        .limit(1);

      if (error) throw error;
      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('Error checking contact entry:', error);
      return false;
    }
  };

  return {
    loading,
    createContactEntry,
    updateContactResult,
    getContactHistory,
    hasContactEntry
  };
};