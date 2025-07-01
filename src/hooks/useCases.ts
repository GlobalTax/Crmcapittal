
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Case {
  id: string;
  title: string;
  description?: string;
  status: string;
  contact?: {
    id: string;
    name: string;
  };
}

export const useCases = () => {
  const { data: cases = [], isLoading } = useQuery({
    queryKey: ['cases'],
    queryFn: async (): Promise<Case[]> => {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          id,
          title,
          description,
          status,
          contact:contacts(id, name)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  return {
    cases,
    isLoading
  };
};
