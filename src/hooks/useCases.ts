
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CreateCaseData } from '@/types/Case';

interface Case {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'suspended' | 'cancelled';
  case_number: string;
  contact_id: string;
  practice_area_id: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actual_hours: number;
  created_at: string;
  updated_at: string;
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
          actual_hours,
          created_at,
          updated_at,
          contact:contacts(id, name),
          company:companies(id, name),
          practice_area:practice_areas(id, name, color)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast the data to match our interface types
      return (data || []).map(item => ({
        ...item,
        status: item.status as 'active' | 'completed' | 'suspended' | 'cancelled',
        priority: item.priority as 'low' | 'medium' | 'high' | 'urgent'
      }));
    }
  });

  const createCaseMutation = useMutation({
    mutationFn: async (data: CreateCaseData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Create the insert data without case_number (it will be auto-generated)
      const insertData = {
        contact_id: data.contact_id,
        company_id: data.company_id,
        practice_area_id: data.practice_area_id,
        proposal_id: data.proposal_id,
        title: data.title,
        description: data.description,
        priority: data.priority || 'medium',
        start_date: data.start_date,
        end_date: data.end_date,
        estimated_hours: data.estimated_hours,
        assigned_to: data.assigned_to,
        created_by: user.id
      };

      // Insert without case_number, let the trigger handle it
      const { data: newCase, error } = await supabase
        .from('cases')
        .insert(insertData)
        .select(`
          id,
          title,
          description,
          status,
          case_number,
          contact_id,
          practice_area_id,
          priority,
          actual_hours,
          created_at,
          updated_at,
          contact:contacts(id, name),
          company:companies(id, name),
          practice_area:practice_areas(id, name, color)
        `)
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
    loading: isLoading,
    error: error?.message,
    refetch,
    createCase: createCaseMutation.mutate,
    isCreating: createCaseMutation.isPending
  };
};
