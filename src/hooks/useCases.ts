
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CreateCaseData } from '@/types/Case';

interface Case {
  id: string;
  title: string;
  description?: string;
  status: string;
  case_number: string;
  contact_id: string;
  practice_area_id: string;
  priority: string;
  contact?: {
    id: string;
    name: string;
  };
  company?: {
    id: string;
    name: string;
  };
  practice_area?: {
    id: string;
    name: string;
    color: string;
  };
}

export const useCases = () => {
  const queryClient = useQueryClient();

  const { data: cases = [], isLoading, error, refetch } = useQuery({
    queryKey: ['cases'],
    queryFn: async (): Promise<Case[]> => {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          id,
          title,
          description,
          status,
          case_number,
          contact_id,
          practice_area_id,
          priority,
          contact:contacts(id, name),
          company:companies(id, name),
          practice_area:practice_areas(id, name, color)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const createCaseMutation = useMutation({
    mutationFn: async (data: CreateCaseData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data: newCase, error } = await supabase
        .from('cases')
        .insert({
          ...data,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return newCase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    }
  });

  return {
    cases,
    isLoading,
    loading: isLoading, // For backward compatibility
    error: error?.message,
    refetch,
    createCase: createCaseMutation.mutate,
    isCreating: createCaseMutation.isPending
  };
};
