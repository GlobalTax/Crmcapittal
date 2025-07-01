
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TimeEntry {
  id: string;
  case_id?: string;
  description: string;
  duration_minutes: number;
  is_billable: boolean;
  created_at: string;
  updated_at: string;
  case?: {
    id: string;
    title: string;
    contact?: {
      name: string;
    };
  };
}

interface CreateTimeEntryData {
  case_id?: string | null;
  description: string;
  duration_minutes: number;
  is_billable: boolean;
}

export const useTimeEntries = () => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Fetch time entries
  const { data: timeEntries = [], isLoading } = useQuery({
    queryKey: ['timeEntries', selectedDate.toDateString()],
    queryFn: async (): Promise<TimeEntry[]> => {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          *,
          case:cases(
            id,
            title,
            contact:contacts(name)
          )
        `)
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Create time entry mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateTimeEntryData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data: timeEntry, error } = await supabase
        .from('time_entries')
        .insert({
          ...data,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return timeEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['dailyTimeData'] });
    }
  });

  // Delete time entry mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['dailyTimeData'] });
    }
  });

  return {
    timeEntries,
    filteredTimeEntries: timeEntries,
    isLoading,
    selectedDate,
    setSelectedDate,
    createTimeEntry: createMutation.mutate,
    isCreating: createMutation.isPending,
    deleteTimeEntry: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending
  };
};
