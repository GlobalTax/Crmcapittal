import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  start_date: string;
  end_date: string;
  location?: string | null;
  attendees?: any[] | null;
  event_type: 'meeting' | 'call' | 'task' | 'appointment';
  status: 'confirmed' | 'tentative' | 'cancelled';
  created_at: string;
  updated_at: string;
  lead_id?: string | null;
  mandate_id?: string | null;
  // Joined data
  lead_name?: string;
  mandate_name?: string;
}

export const useCalendarEvents = (month?: Date) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('calendar_events')
          .select(`
            *,
            leads!lead_id(name),
            buying_mandates!mandate_id(mandate_name)
          `)
          .eq('user_id', user.id)
          .order('start_date', { ascending: true });

        // Filter by month if provided
        if (month) {
          const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
          const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59);
          
          query = query
            .gte('start_date', startOfMonth.toISOString())
            .lte('start_date', endOfMonth.toISOString());
        }

        const { data, error } = await query;

        if (error) throw error;

        setEvents((data || []) as CalendarEvent[]);
      } catch (err) {
        console.error('Error fetching calendar events:', err);
        setError(err instanceof Error ? err.message : 'Error fetching events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user, month]);

  const refetch = async () => {
    if (!user) return;
    
    setLoading(true);
    await fetchEvents();
  };

  async function fetchEvents() {
    if (!user) return;

    try {
      setError(null);

      let query = supabase
        .from('calendar_events')
        .select(`
          *,
          leads!lead_id(name),
          buying_mandates!mandate_id(mandate_name)
        `)
        .eq('user_id', user.id)
        .order('start_date', { ascending: true });

      if (month) {
        const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
        const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59);
        
        query = query
          .gte('start_date', startOfMonth.toISOString())
          .lte('start_date', endOfMonth.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      setEvents((data || []) as CalendarEvent[]);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      setError(err instanceof Error ? err.message : 'Error fetching events');
    } finally {
      setLoading(false);
    }
  }

  return { events, loading, error, refetch };
};

export const useUpcomingEvents = (limit: number = 5) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('calendar_events')
          .select(`
            *,
            leads!lead_id(name),
            buying_mandates!mandate_id(mandate_name)
          `)
          .eq('user_id', user.id)
          .gte('start_date', new Date().toISOString())
          .order('start_date', { ascending: true })
          .limit(limit);

        if (error) throw error;

        setEvents((data || []) as CalendarEvent[]);
      } catch (err) {
        console.error('Error fetching upcoming events:', err);
        setError(err instanceof Error ? err.message : 'Error fetching events');
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, [user, limit]);

  return { events, loading, error };
};