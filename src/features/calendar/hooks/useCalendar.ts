import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarService } from '../services/calendarService';
import { 
  CalendarEvent, 
  CreateEventData, 
  UpdateEventData, 
  CalendarFilter,
  CalendarMetrics,
  SchedulingSuggestion 
} from '../types';
import { toast } from '@/hooks/use-toast';

// ============= EVENTS HOOKS =============

export const useCalendarEvents = (filter: CalendarFilter = {}) => {
  return useQuery({
    queryKey: ['calendar-events', filter],
    queryFn: async () => {
      const { data, error } = await CalendarService.getEvents(filter);
      if (error) throw new Error(error);
      return data;
    },
  });
};

export const useCalendarEvent = (id: string) => {
  return useQuery({
    queryKey: ['calendar-event', id],
    queryFn: async () => {
      const { data, error } = await CalendarService.getEvent(id);
      if (error) throw new Error(error);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (eventData: CreateEventData) => CalendarService.createEvent(eventData),
    onSuccess: (result) => {
      if (result.error) {
        toast({
          title: "Error al crear evento",
          description: result.error,
          variant: "destructive",
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
        queryClient.invalidateQueries({ queryKey: ['calendar-analytics'] });
        toast({
          title: "Evento creado",
          description: "El evento se ha creado correctamente.",
        });
      }
      return result;
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear evento",
        description: error.message || "No se pudo crear el evento.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (eventData: UpdateEventData) => CalendarService.updateEvent(eventData),
    onSuccess: (result) => {
      if (result.error) {
        toast({
          title: "Error al actualizar evento",
          description: result.error,
          variant: "destructive",
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
        queryClient.invalidateQueries({ queryKey: ['calendar-event', result.data?.id] });
        queryClient.invalidateQueries({ queryKey: ['calendar-analytics'] });
        toast({
          title: "Evento actualizado",
          description: "Los cambios se han guardado correctamente.",
        });
      }
      return result;
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar evento",
        description: error.message || "No se pudo actualizar el evento.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => CalendarService.deleteEvent(id),
    onSuccess: (result) => {
      if (result.error) {
        toast({
          title: "Error al eliminar evento",
          description: result.error,
          variant: "destructive",
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
        queryClient.invalidateQueries({ queryKey: ['calendar-analytics'] });
        toast({
          title: "Evento eliminado",
          description: "El evento se ha eliminado correctamente.",
        });
      }
      return result;
    },
    onError: (error: any) => {
      toast({
        title: "Error al eliminar evento",
        description: error.message || "No se pudo eliminar el evento.",
        variant: "destructive",
      });
    },
  });
};

// ============= CRM INTEGRATION HOOKS =============

export const useCreateEventFromDeal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ dealId, eventType }: { dealId: string; eventType: 'demo' | 'follow_up' | 'closing' }) => 
      CalendarService.createEventFromDeal(dealId, eventType),
    onSuccess: (result) => {
      if (result.error) {
        toast({
          title: "Error al crear evento",
          description: result.error,
          variant: "destructive",
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
        toast({
          title: "Evento creado desde deal",
          description: "El evento se ha programado correctamente.",
        });
      }
      return result;
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear evento",
        description: error.message || "No se pudo crear el evento desde el deal.",
        variant: "destructive",
      });
    },
  });
};

export const useQuickScheduleFromContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ contactId, type }: { contactId: string; type: 'call' | 'meeting' }) => 
      CalendarService.quickScheduleFromContact(contactId, type),
    onSuccess: (result) => {
      if (result.error) {
        toast({
          title: "Error al programar",
          description: result.error,
          variant: "destructive",
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
        toast({
          title: "Evento programado",
          description: "El evento se ha programado rápidamente.",
        });
      }
      return result;
    },
    onError: (error: any) => {
      toast({
        title: "Error al programar",
        description: error.message || "No se pudo programar el evento.",
        variant: "destructive",
      });
    },
  });
};

// ============= ANALYTICS HOOKS =============

export const useCalendarMetrics = (period: '7d' | '30d' | '90d' = '30d') => {
  return useQuery({
    queryKey: ['calendar-metrics', period],
    queryFn: async () => {
      const { data, error } = await CalendarService.getCalendarMetrics(period);
      if (error) throw new Error(error);
      return data;
    },
  });
};

export const useSchedulingSuggestions = () => {
  return useQuery({
    queryKey: ['scheduling-suggestions'],
    queryFn: async () => {
      const { data, error } = await CalendarService.getSchedulingSuggestions();
      if (error) throw new Error(error);
      return data;
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// ============= COMBINED HOOKS =============

export const useCalendarMutations = () => {
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const createEventFromDeal = useCreateEventFromDeal();
  const quickScheduleFromContact = useQuickScheduleFromContact();

  return {
    createEvent: createEvent.mutateAsync,
    updateEvent: updateEvent.mutateAsync,
    deleteEvent: deleteEvent.mutateAsync,
    createEventFromDeal: createEventFromDeal.mutateAsync,
    quickScheduleFromContact: quickScheduleFromContact.mutateAsync,
    loading: createEvent.isPending || updateEvent.isPending || deleteEvent.isPending ||
             createEventFromDeal.isPending || quickScheduleFromContact.isPending,
  };
};

// ============= HELPER HOOKS =============

export const useEventsForDate = (date: Date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return useCalendarEvents({
    start_date: startOfDay.toISOString(),
    end_date: endOfDay.toISOString(),
  });
};

export const useEventsForWeek = (weekStart: Date) => {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return useCalendarEvents({
    start_date: weekStart.toISOString(),
    end_date: weekEnd.toISOString(),
  });
};

export const useEventsForMonth = (month: Date) => {
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  monthEnd.setHours(23, 59, 59, 999);

  return useCalendarEvents({
    start_date: monthStart.toISOString(),
    end_date: monthEnd.toISOString(),
  });
};