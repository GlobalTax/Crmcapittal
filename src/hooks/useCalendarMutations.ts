import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarEvent } from './useCalendarEvents';
import { toast } from 'sonner';

export interface CreateEventData {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  location?: string;
  attendees?: any[];
  event_type: 'meeting' | 'call' | 'task' | 'appointment';
  status?: 'confirmed' | 'tentative' | 'cancelled';
}

export const useCalendarMutations = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const createEvent = async (eventData: CreateEventData): Promise<CalendarEvent | null> => {
    if (!user) {
      toast.error('Debes estar autenticado para crear eventos');
      return null;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          ...eventData,
          user_id: user.id,
          status: eventData.status || 'confirmed'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Evento creado exitosamente');
      return data as CalendarEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Error al crear el evento');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (id: string, eventData: Partial<CreateEventData>): Promise<CalendarEvent | null> => {
    if (!user) {
      toast.error('Debes estar autenticado para actualizar eventos');
      return null;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('calendar_events')
        .update(eventData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Evento actualizado exitosamente');
      return data as CalendarEvent;
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Error al actualizar el evento');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id: string): Promise<boolean> => {
    if (!user) {
      toast.error('Debes estar autenticado para eliminar eventos');
      return false;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Evento eliminado exitosamente');
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Error al eliminar el evento');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createEvent,
    updateEvent,
    deleteEvent,
    loading
  };
};