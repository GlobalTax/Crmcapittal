import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { WinbackAttempt, WinbackAttemptStatus } from '@/types/Winback';

export const useWinbackAttempts = (leadId?: string) => {
  const [attempts, setAttempts] = useState<WinbackAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttempts = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('winback_attempts')
        .select('*')
        .order('scheduled_date', { ascending: true });

      if (leadId) {
        query = query.eq('lead_id', leadId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAttempts((data || []).map(attempt => ({
        ...attempt,
        status: attempt.status as WinbackAttempt['status'],
        canal: attempt.canal as any
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando intentos winback');
      toast.error('Error cargando intentos winback');
    } finally {
      setIsLoading(false);
    }
  };

  const markAttemptExecuted = async (
    attemptId: string, 
    status: WinbackAttemptStatus,
    notes?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('winback_attempts')
        .update({
          status,
          executed_date: new Date().toISOString(),
          notes
        })
        .eq('id', attemptId)
        .select()
        .single();

      if (error) throw error;
      
      const mappedData = {
        ...data,
        status: data.status as WinbackAttempt['status'],
        canal: data.canal as any
      };
      setAttempts(prev => prev.map(attempt => 
        attempt.id === attemptId ? mappedData : attempt
      ));
      
      toast.success('Intento winback actualizado');
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error actualizando intento';
      toast.error(message);
      throw err;
    }
  };

  const getPendingAttempts = () => {
    const today = new Date().toISOString().split('T')[0];
    return attempts.filter(attempt => 
      attempt.status === 'pending' && 
      attempt.scheduled_date <= today
    );
  };

  const getUpcomingAttempts = () => {
    const today = new Date().toISOString().split('T')[0];
    return attempts.filter(attempt => 
      attempt.status === 'pending' && 
      attempt.scheduled_date > today
    );
  };

  const initiateWinbackSequence = async (leadId: string, sequenceId?: string) => {
    try {
      const { error } = await supabase.rpc('initiate_winback_sequence', {
        p_lead_id: leadId,
        p_sequence_id: sequenceId
      });

      if (error) throw error;
      
      toast.success('Secuencia winback iniciada');
      await fetchAttempts(); // Refresh to show new attempts
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error iniciando secuencia winback';
      toast.error(message);
      throw err;
    }
  };

  const markWinbackResponse = async (leadId: string, responseType: 'positive' | 'negative' | 'neutral') => {
    try {
      const { error } = await supabase.rpc('mark_winback_response', {
        p_lead_id: leadId,
        p_response_type: responseType
      });

      if (error) throw error;
      
      toast.success('Respuesta winback registrada');
      await fetchAttempts(); // Refresh attempts
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error registrando respuesta';
      toast.error(message);
      throw err;
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, [leadId]);

  return {
    attempts,
    isLoading,
    error,
    markAttemptExecuted,
    getPendingAttempts,
    getUpcomingAttempts,
    initiateWinbackSequence,
    markWinbackResponse,
    refetch: fetchAttempts
  };
};