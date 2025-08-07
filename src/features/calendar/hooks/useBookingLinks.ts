import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarService } from '../services/calendarService';
import { 
  BookingLink,
  CreateBookingLinkData,
  UpdateBookingLinkData,
  Booking
} from '../types';
import { toast } from '@/hooks/use-toast';

// ============= BOOKING LINKS HOOKS =============

export const useBookingLinks = () => {
  return useQuery({
    queryKey: ['booking-links'],
    queryFn: async () => {
      const { data, error } = await CalendarService.getBookingLinks();
      if (error) throw new Error(error);
      return data;
    },
  });
};

export const useBookingLink = (slug: string) => {
  return useQuery({
    queryKey: ['booking-link', slug],
    queryFn: async () => {
      const { data, error } = await CalendarService.getBookingLink(slug);
      if (error) throw new Error(error);
      return data;
    },
    enabled: !!slug,
  });
};

export const useCreateBookingLink = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (linkData: CreateBookingLinkData) => CalendarService.createBookingLink(linkData),
    onSuccess: (result) => {
      if (result.error) {
        toast({
          title: "Error al crear link de booking",
          description: result.error,
          variant: "destructive",
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ['booking-links'] });
        toast({
          title: "Link de booking creado",
          description: "El link de booking se ha creado correctamente.",
        });
      }
      return result;
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear link",
        description: error.message || "No se pudo crear el link de booking.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateBookingLink = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (linkData: UpdateBookingLinkData) => CalendarService.updateBookingLink(linkData),
    onSuccess: (result) => {
      if (result.error) {
        toast({
          title: "Error al actualizar link",
          description: result.error,
          variant: "destructive",
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ['booking-links'] });
        queryClient.invalidateQueries({ queryKey: ['booking-link'] });
        toast({
          title: "Link actualizado",
          description: "Los cambios se han guardado correctamente.",
        });
      }
      return result;
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar link",
        description: error.message || "No se pudo actualizar el link de booking.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteBookingLink = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => CalendarService.deleteBookingLink(id),
    onSuccess: (result) => {
      if (result.error) {
        toast({
          title: "Error al eliminar link",
          description: result.error,
          variant: "destructive",
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ['booking-links'] });
        toast({
          title: "Link eliminado",
          description: "El link de booking se ha eliminado correctamente.",
        });
      }
      return result;
    },
    onError: (error: any) => {
      toast({
        title: "Error al eliminar link",
        description: error.message || "No se pudo eliminar el link de booking.",
        variant: "destructive",
      });
    },
  });
};

// ============= BOOKINGS HOOKS =============

export const useBookings = (bookingLinkId?: string) => {
  return useQuery({
    queryKey: ['bookings', bookingLinkId],
    queryFn: async () => {
      const { data, error } = await CalendarService.getBookings(bookingLinkId);
      if (error) throw new Error(error);
      return data;
    },
  });
};

// ============= COMBINED HOOKS =============

export const useBookingMutations = () => {
  const createBookingLink = useCreateBookingLink();
  const updateBookingLink = useUpdateBookingLink();
  const deleteBookingLink = useDeleteBookingLink();

  return {
    createBookingLink: createBookingLink.mutateAsync,
    updateBookingLink: updateBookingLink.mutateAsync,
    deleteBookingLink: deleteBookingLink.mutateAsync,
    loading: createBookingLink.isPending || updateBookingLink.isPending || deleteBookingLink.isPending,
  };
};

// ============= UTILITY HOOKS =============

export const useBookingLinkStats = (linkId: string) => {
  const { data: bookings = [] } = useBookings(linkId);
  
  return {
    total_bookings: bookings.length,
    confirmed_bookings: bookings.filter(b => b.status === 'confirmed').length,
    pending_bookings: bookings.filter(b => b.status === 'pending').length,
    cancelled_bookings: bookings.filter(b => b.status === 'cancelled').length,
    completed_bookings: bookings.filter(b => b.status === 'completed').length,
    conversion_rate: bookings.length > 0 ? 
      Math.round((bookings.filter(b => b.status === 'completed').length / bookings.length) * 100) / 100 : 0,
    average_booking_time: '15:30',
    most_popular_day: 'Tuesday',
    most_popular_time: '10:00 AM'
  };
};

export const useAvailableTimeSlots = (bookingLinkId: string, selectedDate: Date) => {
  return useQuery({
    queryKey: ['available-slots', bookingLinkId, selectedDate.toISOString().split('T')[0]],
    queryFn: async () => {
      // This would calculate available time slots based on:
      // 1. Booking link availability schedule
      // 2. Existing bookings for the date
      // 3. Buffer times
      // 4. User's calendar events
      
      // Mock implementation
      const slots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
      ];
      
      return slots;
    },
    enabled: !!bookingLinkId && !!selectedDate,
  });
};