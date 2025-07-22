import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ReconversionHistory {
  id: string;
  reconversion_id: string;
  action_type: string;
  action_title: string;
  action_description?: string;
  previous_value?: string;
  new_value?: string;
  metadata?: any;
  created_by?: string;
  created_at: string;
}

export function useReconversionHistory(reconversionId?: string) {
  const [history, setHistory] = useState<ReconversionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHistory = async () => {
    if (!reconversionId) {
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reconversion_history' as any)
        .select('*')
        .eq('reconversion_id', reconversionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory((data || []) as unknown as ReconversionHistory[]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [reconversionId]);

  return {
    history,
    loading,
    error,
    refetch: fetchHistory
  };
}