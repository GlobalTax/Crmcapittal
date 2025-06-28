
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TimeEntry {
  id: string;
  user_id: string;
  contact_id?: string;
  operation_id?: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  description?: string;
  activity_type: string;
  is_billable: boolean;
  hourly_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface TimeGoal {
  id: string;
  user_id: string;
  goal_type: 'daily' | 'weekly' | 'monthly';
  target_hours: number;
  activity_type?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useTimeTracking = () => {
  const { toast } = useToast();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [timeGoals, setTimeGoals] = useState<TimeGoal[]>([]);
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch time entries
  const fetchTimeEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .order('start_time', { ascending: false });

      if (error) throw error;
      setTimeEntries(data || []);
    } catch (error) {
      console.error('Error fetching time entries:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las entradas de tiempo',
        variant: 'destructive',
      });
    }
  };

  // Fetch time goals
  const fetchTimeGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('time_goals')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTimeGoals(data || []);
    } catch (error) {
      console.error('Error fetching time goals:', error);
    }
  };

  // Start timer
  const startTimer = async (contactId?: string, operationId?: string, activityType = 'general', description = '') => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          user_id: user.id,
          contact_id: contactId,
          operation_id: operationId,
          start_time: new Date().toISOString(),
          activity_type: activityType,
          description: description,
          is_billable: true,
        })
        .select()
        .single();

      if (error) throw error;
      
      setActiveTimer(data);
      toast({
        title: 'Timer iniciado',
        description: 'Se ha comenzado a registrar el tiempo',
      });
    } catch (error) {
      console.error('Error starting timer:', error);
      toast({
        title: 'Error',
        description: 'No se pudo iniciar el timer',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Stop timer
  const stopTimer = async () => {
    if (!activeTimer) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('time_entries')
        .update({
          end_time: new Date().toISOString(),
        })
        .eq('id', activeTimer.id);

      if (error) throw error;
      
      setActiveTimer(null);
      fetchTimeEntries();
      toast({
        title: 'Timer detenido',
        description: 'Se ha guardado la entrada de tiempo',
      });
    } catch (error) {
      console.error('Error stopping timer:', error);
      toast({
        title: 'Error',
        description: 'No se pudo detener el timer',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Create time goal
  const createTimeGoal = async (goalData: Omit<TimeGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('time_goals')
        .insert({
          ...goalData,
          user_id: user.id,
        });

      if (error) throw error;
      
      fetchTimeGoals();
      toast({
        title: 'Objetivo creado',
        description: 'Se ha establecido un nuevo objetivo de tiempo',
      });
    } catch (error) {
      console.error('Error creating time goal:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el objetivo',
        variant: 'destructive',
      });
    }
  };

  // Update time entry
  const updateTimeEntry = async (id: string, updates: Partial<TimeEntry>) => {
    try {
      const { error } = await supabase
        .from('time_entries')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      fetchTimeEntries();
      toast({
        title: 'Entry actualizada',
        description: 'Se ha actualizado la entrada de tiempo',
      });
    } catch (error) {
      console.error('Error updating time entry:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la entrada',
        variant: 'destructive',
      });
    }
  };

  // Delete time entry
  const deleteTimeEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      fetchTimeEntries();
      toast({
        title: 'Entry eliminada',
        description: 'Se ha eliminado la entrada de tiempo',
      });
    } catch (error) {
      console.error('Error deleting time entry:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la entrada',
        variant: 'destructive',
      });
    }
  };

  // Get time statistics
  const getTimeStats = () => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayEntries = timeEntries.filter(entry => 
      new Date(entry.start_time).toDateString() === new Date().toDateString()
    );

    const weekEntries = timeEntries.filter(entry => 
      new Date(entry.start_time) >= startOfWeek
    );

    const monthEntries = timeEntries.filter(entry => 
      new Date(entry.start_time) >= startOfMonth
    );

    const calculateTotal = (entries: TimeEntry[]) => 
      entries.reduce((total, entry) => total + (entry.duration_minutes || 0), 0);

    return {
      today: Math.round(calculateTotal(todayEntries) / 60 * 100) / 100,
      week: Math.round(calculateTotal(weekEntries) / 60 * 100) / 100,
      month: Math.round(calculateTotal(monthEntries) / 60 * 100) / 100,
      billableToday: Math.round(calculateTotal(todayEntries.filter(e => e.is_billable)) / 60 * 100) / 100,
    };
  };

  useEffect(() => {
    fetchTimeEntries();
    fetchTimeGoals();
  }, []);

  return {
    timeEntries,
    timeGoals,
    activeTimer,
    loading,
    startTimer,
    stopTimer,
    createTimeGoal,
    updateTimeEntry,
    deleteTimeEntry,
    getTimeStats,
    fetchTimeEntries,
    fetchTimeGoals,
  };
};
