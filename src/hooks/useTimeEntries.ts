import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { TimeEntry, CreateTimeEntryData } from '@/types/TimeTracking';

export const useTimeEntries = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Fetch time entries for the selected date
  const {
    data: timeEntries,
    isLoading,
    error
  } = useQuery({
    queryKey: ['timeEntries', selectedDate.toISOString().split('T')[0]],
    queryFn: async () => {
      if (!user) return [];
      
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);
      
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          *,
          planned_task:planned_tasks(title),
          lead:leads(id, name, company_name),
          mandate:buying_mandates(id, mandate_name, client_name),
          contact:contacts(id, name)
        `)
        .eq('user_id', user.id)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .order('start_time', { ascending: false });

      if (error) throw error;
      
      // Calculate duration for entries that don't have end_time set
      return (data || []).map(entry => {
        if (!entry.end_time && entry.start_time) {
          const start = new Date(entry.start_time);
          const now = new Date();
          const diffMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
          return {
            ...entry,
            duration_minutes: diffMinutes
          };
        }
        return entry;
      });
    },
    enabled: !!user,
    retry: 1, // Reduced retries from 2 to 1
    refetchOnWindowFocus: true,
    refetchInterval: 60000, // Refetch every 60 seconds (reduced from 30s)
  });

  // Create time entry mutation
  const {
    mutate: createTimeEntry,
    isPending: isCreating
  } = useMutation({
    mutationFn: async (data: CreateTimeEntryData) => {
      if (!user) throw new Error('Usuario no autenticado');
      
      // Calculate duration if both start and end times are provided
      let calculatedDuration = undefined;
      if (data.start_time && data.end_time) {
        const start = new Date(data.start_time);
        const end = new Date(data.end_time);
        calculatedDuration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
      }
      
      const { data: newEntry, error } = await supabase
        .from('time_entries')
        .insert([{
          ...data,
          user_id: user.id,
          duration_minutes: calculatedDuration
        }])
        .select()
        .single();

      if (error) throw error;
      return newEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      toast.success('Entrada de tiempo creada exitosamente');
    },
    onError: (error) => {
      console.error('Error creating time entry:', error);
      toast.error('Error al crear la entrada de tiempo');
    }
  });

  // Delete time entry mutation
  const {
    mutate: deleteTimeEntry,
    isPending: isDeleting
  } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
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
    timeEntries: timeEntries || [],
    filteredTimeEntries: timeEntries || [],
    isLoading,
    error,
    selectedDate,
    setSelectedDate: handleDateChange,
    createTimeEntry,
    isCreating,
    deleteTimeEntry,
    isDeleting
  };
};