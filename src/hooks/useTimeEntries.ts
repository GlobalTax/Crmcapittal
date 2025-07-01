
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TimeEntry {
  id: string;
  description: string;
  duration_minutes: number;
  is_billable: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateTimeEntryData {
  description: string;
  duration_minutes: number;
  is_billable: boolean;
}

export const useTimeEntries = () => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Fetch time entries with proper error handling
  const { data: timeEntries = [], isLoading, error } = useQuery({
    queryKey: ['timeEntries', selectedDate.toDateString()],
    queryFn: async (): Promise<TimeEntry[]> => {
      try {
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const { data, error } = await supabase
          .from('time_entries')
          .select(`
            id,
            description,
            duration_minutes,
            is_billable,
            created_at,
            updated_at
          `)
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString())
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching time entries:', error);
          throw error;
        }
        return data || [];
      } catch (err) {
        console.error('Failed to fetch time entries:', err);
        return [];
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry on 406 errors (likely RLS issues)
      if (error?.status === 406) {
        return false;
      }
      return failureCount < 3;
    },
    refetchOnWindowFocus: false,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Create time entry mutation with proper error handling
  const createMutation = useMutation({
    mutationFn: async (data: CreateTimeEntryData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data: timeEntry, error } = await supabase
        .from('time_entries')
        .insert({
          user_id: user.id,
          description: data.description,
          duration_minutes: data.duration_minutes,
          is_billable: data.is_billable,
          activity_type: 'work',
          start_time: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return timeEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['dailyTimeData'] });
      toast.success('Tiempo registrado correctamente');
    },
    onError: (error) => {
      console.error('Error creating time entry:', error);
      toast.error('Error al registrar el tiempo');
    }
  });

  // Delete time entry mutation with proper error handling
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
      toast.success('Entrada de tiempo eliminada');
    },
    onError: (error) => {
      console.error('Error deleting time entry:', error);
      toast.error('Error al eliminar la entrada de tiempo');
    }
  });

  // Memoize the setSelectedDate callback to prevent unnecessary re-renders
  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  return {
    timeEntries,
    filteredTimeEntries: timeEntries,
    isLoading,
    error,
    selectedDate,
    setSelectedDate: handleDateChange,
    createTimeEntry: createMutation.mutate,
    isCreating: createMutation.isPending,
    deleteTimeEntry: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending
  };
};
