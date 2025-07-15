import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RodLog } from '@/types/RodLog';

export const useRodLog = () => {
  const { data: rodLogs, isLoading, error, refetch } = useQuery({
    queryKey: ['rod_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rod_log')
        .select('*')
        .order('sent_at', { ascending: false });

      if (error) throw error;
      return data as RodLog[];
    },
  });

  return {
    rodLogs: rodLogs || [],
    isLoading,
    error,
    refetch,
  };
};