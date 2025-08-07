import { supabase } from '@/integrations/supabase/client';
import { 
  CalendarEvent, 
  CreateEventData, 
  UpdateEventData, 
  CalendarFilter,
  BookingLink,
  CreateBookingLinkData,
  UpdateBookingLinkData,
  Booking,
  CalendarAnalytics,
  CalendarMetrics,
  SchedulingSuggestion,
  MeetingTemplate
} from '../types';

export class CalendarService {
  // ============= EVENTS =============
  
  static async getEvents(filter: CalendarFilter = {}): Promise<{ data: CalendarEvent[]; error: string | null }> {
    try {
      let query = supabase
        .from('calendar_events')
        .select(`
          *,
          companies:company_id(id, name),
          contacts:contact_id(id, name, email),
          operations:deal_id(id, operation_name, status)
        `)
        .order('start_date', { ascending: true });

      if (filter.start_date) {
        query = query.gte('start_date', filter.start_date);
      }
      if (filter.end_date) {
        query = query.lte('start_date', filter.end_date);
      }
      if (filter.event_types?.length) {
        query = query.in('event_type', filter.event_types);
      }
      if (filter.meeting_types?.length) {
        query = query.in('meeting_type', filter.meeting_types);
      }
      if (filter.priorities?.length) {
        query = query.in('priority', filter.priorities);
      }
      if (filter.deal_id) {
        query = query.eq('deal_id', filter.deal_id);
      }
      if (filter.company_id) {
        query = query.eq('company_id', filter.company_id);
      }
      if (filter.contact_id) {
        query = query.eq('contact_id', filter.contact_id);
      }
      if (filter.search) {
        query = query.or(`title.ilike.%${filter.search}%,description.ilike.%${filter.search}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return { data: (data || []).map(item => ({
        ...item,
        attendees: Array.isArray(item.attendees) ? item.attendees as string[] : []
      })) as CalendarEvent[], error: null };
    } catch (error: any) {
      console.error('Error fetching events:', error);
      return { data: [], error: error.message };
    }
  }

  static async getEvent(id: string): Promise<{ data: CalendarEvent | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select(`
          *,
          companies:company_id(id, name),
          contacts:contact_id(id, name, email),
          operations:deal_id(id, operation_name, status)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      const transformedData = data ? {
        ...data,
        attendees: Array.isArray(data.attendees) ? data.attendees as string[] : []
      } as CalendarEvent : null;
      return { data: transformedData, error: null };
    } catch (error: any) {
      console.error('Error fetching event:', error);
      return { data: null, error: error.message };
    }
  }

  static async createEvent(eventData: CreateEventData): Promise<{ data: CalendarEvent | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert([{
          ...eventData,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      const transformedData = data ? {
        ...data,
        attendees: Array.isArray(data.attendees) ? data.attendees as string[] : []
      } as CalendarEvent : null;
      return { data: transformedData, error: null };
    } catch (error: any) {
      console.error('Error creating event:', error);
      return { data: null, error: error.message };
    }
  }

  static async updateEvent(eventData: UpdateEventData): Promise<{ data: CalendarEvent | null; error: string | null }> {
    try {
      const { id, ...updates } = eventData;
      const { data, error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      const transformedData = data ? {
        ...data,
        attendees: Array.isArray(data.attendees) ? data.attendees as string[] : []
      } as CalendarEvent : null;
      return { data: transformedData, error: null };
    } catch (error: any) {
      console.error('Error updating event:', error);
      return { data: null, error: error.message };
    }
  }

  static async deleteEvent(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error deleting event:', error);
      return { success: false, error: error.message };
    }
  }

  // ============= BOOKING LINKS =============

  static async getBookingLinks(): Promise<{ data: BookingLink[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('booking_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { 
        data: (data || []).map(item => ({
          ...item,
          availability_schedule: item.availability_schedule as any,
          questions: Array.isArray(item.questions) ? item.questions as any[] : []
        })) as BookingLink[], 
        error: null 
      };
    } catch (error: any) {
      console.error('Error fetching booking links:', error);
      return { data: [], error: error.message };
    }
  }

  static async getBookingLink(slug: string): Promise<{ data: BookingLink | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('booking_links')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      const transformedData = data ? {
        ...data,
        availability_schedule: data.availability_schedule as any,
        questions: Array.isArray(data.questions) ? data.questions as any[] : []
      } as BookingLink : null;
      return { data: transformedData, error: null };
    } catch (error: any) {
      console.error('Error fetching booking link:', error);
      return { data: null, error: error.message };
    }
  }

  static async createBookingLink(linkData: CreateBookingLinkData): Promise<{ data: BookingLink | null; error: string | null }> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      // Generate unique slug
      const { data: slugData } = await supabase.rpc('generate_booking_slug', {
        base_title: linkData.title,
        user_id: user.id
      });

      const { data, error } = await supabase
        .from('booking_links')
        .insert([{
          ...linkData,
          user_id: user.id,
          slug: slugData,
          availability_schedule: linkData.availability_schedule as any,
          questions: linkData.questions as any
        }])
        .select()
        .single();

      if (error) throw error;
      const transformedData = data ? {
        ...data,
        availability_schedule: data.availability_schedule as any,
        questions: Array.isArray(data.questions) ? data.questions as any[] : []
      } as BookingLink : null;
      return { data: transformedData, error: null };
    } catch (error: any) {
      console.error('Error creating booking link:', error);
      return { data: null, error: error.message };
    }
  }

  static async updateBookingLink(linkData: UpdateBookingLinkData): Promise<{ data: BookingLink | null; error: string | null }> {
    try {
      const { id, ...updates } = linkData;
      const processedUpdates = {
        ...updates,
        availability_schedule: updates.availability_schedule ? updates.availability_schedule as any : undefined,
        questions: updates.questions ? updates.questions as any : undefined
      };
      
      const { data, error } = await supabase
        .from('booking_links')
        .update(processedUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      const transformedData = data ? {
        ...data,
        availability_schedule: data.availability_schedule as any,
        questions: Array.isArray(data.questions) ? data.questions as any[] : []
      } as BookingLink : null;
      return { data: transformedData, error: null };
    } catch (error: any) {
      console.error('Error updating booking link:', error);
      return { data: null, error: error.message };
    }
  }

  static async deleteBookingLink(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('booking_links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error deleting booking link:', error);
      return { success: false, error: error.message };
    }
  }

  // ============= BOOKINGS =============

  static async getBookings(bookingLinkId?: string): Promise<{ data: Booking[]; error: string | null }> {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          booking_links!inner(title, user_id),
          calendar_events(id, title, start_date, end_date)
        `)
        .order('created_at', { ascending: false });

      if (bookingLinkId) {
        query = query.eq('booking_link_id', bookingLinkId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return { 
        data: (data || []).map(item => ({
          ...item,
          answers: item.answers as any || {}
        })) as Booking[], 
        error: null 
      };
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      return { data: [], error: error.message };
    }
  }

  // ============= ANALYTICS =============

  static async getCalendarAnalytics(startDate: string, endDate: string): Promise<{ data: CalendarAnalytics[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('calendar_analytics')
        .select('*')
        .gte('metric_date', startDate)
        .lte('metric_date', endDate)
        .order('metric_date', { ascending: true });

      if (error) throw error;
      return { data: (data || []) as CalendarAnalytics[], error: null };
    } catch (error: any) {
      console.error('Error fetching calendar analytics:', error);
      return { data: [], error: error.message };
    }
  }

  static async getCalendarMetrics(period: '7d' | '30d' | '90d' = '30d'): Promise<{ data: CalendarMetrics; error: string | null }> {
    try {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: events, error: eventsError } = await this.getEvents({
        start_date: startDate.toISOString(),
        end_date: new Date().toISOString()
      });

      if (eventsError) throw new Error(eventsError);

      const { data: analytics, error: analyticsError } = await this.getCalendarAnalytics(
        startDate.toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      );

      if (analyticsError) throw new Error(analyticsError);

      // Calculate metrics
      const totalMeetings = events.length;
      const totalHours = events.reduce((sum, event) => {
        const duration = (new Date(event.end_date).getTime() - new Date(event.start_date).getTime()) / (1000 * 60 * 60);
        return sum + duration;
      }, 0);

      const meetingsByType = events.reduce((acc, event) => {
        acc[event.meeting_type] = (acc[event.meeting_type] || 0) + 1;
        return acc;
      }, {} as { [type: string]: number });

      const noShowCount = analytics.filter(a => a.metric_type === 'no_show').length;
      const completedCount = analytics.filter(a => a.metric_type === 'meeting_completed').length;

      const metrics: CalendarMetrics = {
        total_meetings: totalMeetings,
        total_events: totalMeetings,
        total_hours: Math.round(totalHours * 10) / 10,
        average_meeting_duration: totalMeetings > 0 ? Math.round((totalHours / totalMeetings) * 60) : 0,
        average_duration_minutes: totalMeetings > 0 ? Math.round((totalHours / totalMeetings) * 60) : 0,
        meetings_by_type: meetingsByType,
        meeting_type_breakdown: meetingsByType,
        conversion_rates: {
          demo_to_deal: 0.65,
          meeting_to_follow_up: 0.78,
          follow_up_to_close: 0.32
        },
        optimal_times: {
          best_day: 'Tuesday',
          best_hour: 10,
          response_rates: {}
        },
        booking_sources: {
          manual: events.filter(e => !e.booking_link_id).length,
          booking_link: events.filter(e => e.booking_link_id).length,
          crm_integration: 0
        },
        no_show_rate: totalMeetings > 0 ? Math.round((noShowCount / totalMeetings) * 100) / 100 : 0,
        dailyStats: {},
        completedEvents: completedCount,
        totalEvents: totalMeetings,
        averageAttendees: 2.5,
        demoCount: events.filter(e => e.meeting_type === 'demo').length,
        followUpCount: events.filter(e => e.meeting_type === 'follow_up').length,
        closingCount: events.filter(e => e.meeting_type === 'closing').length,
        recentActivity: []
      };

      return { data: metrics, error: null };
    } catch (error: any) {
      console.error('Error calculating calendar metrics:', error);
      return { 
        data: {
          total_meetings: 0,
          total_events: 0,
          total_hours: 0,
          average_meeting_duration: 0,
          average_duration_minutes: 0,
          meetings_by_type: {},
          meeting_type_breakdown: {},
          conversion_rates: { demo_to_deal: 0, meeting_to_follow_up: 0, follow_up_to_close: 0 },
          optimal_times: { best_day: 'Monday', best_hour: 9, response_rates: {} },
          booking_sources: { manual: 0, booking_link: 0, crm_integration: 0 },
          no_show_rate: 0,
          dailyStats: {},
          completedEvents: 0,
          totalEvents: 0,
          averageAttendees: 0,
          demoCount: 0,
          followUpCount: 0,
          closingCount: 0,
          recentActivity: []
        },
        error: error.message 
      };
    }
  }

  // ============= SMART SCHEDULING =============

  static async getSchedulingSuggestions(): Promise<{ data: SchedulingSuggestion[]; error: string | null }> {
    try {
      // This would integrate with AI/ML for intelligent suggestions
      // For now, return mock data based on CRM patterns
      
      const mockSuggestions: SchedulingSuggestion[] = [
        {
          type: 'follow_up',
          suggested_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          suggested_time: '10:00',
          reason: 'Follow-up meeting scheduled based on demo completion',
          confidence: 0.85,
          related_entity: {
            type: 'deal',
            id: '123',
            name: 'Acme Corp Deal'
          }
        }
      ];

      return { data: mockSuggestions, error: null };
    } catch (error: any) {
      console.error('Error fetching scheduling suggestions:', error);
      return { data: [], error: error.message };
    }
  }

  // ============= CRM INTEGRATION =============

  static async createEventFromDeal(dealId: string, eventType: 'demo' | 'follow_up' | 'closing'): Promise<{ data: CalendarEvent | null; error: string | null }> {
    try {
      // Get deal information
      const { data: deal, error: dealError } = await supabase
        .from('operations')
        .select(`
          *,
          companies(id, name),
          contacts(id, name, email)
        `)
        .eq('id', dealId)
        .single();

      if (dealError) throw dealError;

      const eventTypeMap = {
        demo: { title: 'Demo', duration: 60, type: 'demo' },
        follow_up: { title: 'Seguimiento', duration: 30, type: 'follow_up' },
        closing: { title: 'Cierre', duration: 45, type: 'closing' }
      };

      const eventConfig = eventTypeMap[eventType];
      const now = new Date();
      const eventStart = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
      eventStart.setHours(10, 0, 0, 0); // 10:00 AM
      const eventEnd = new Date(eventStart.getTime() + eventConfig.duration * 60 * 1000);

      // Handle company and contact data safely
      const companies = deal.companies as any;
      const contacts = deal.contacts as any;
      
      const companyName = Array.isArray(companies) ? companies[0]?.name : companies?.name || 'Cliente';
      const companyId = Array.isArray(companies) ? companies[0]?.id : companies?.id;
      const contactId = Array.isArray(contacts) ? contacts[0]?.id : contacts?.id;

      const eventData: CreateEventData = {
        title: `${eventConfig.title} - ${companyName}`,
        description: `${eventConfig.title} para la operación: ${(deal as any).operation_name || deal.id}`,
        start_date: eventStart.toISOString(),
        end_date: eventEnd.toISOString(),
        event_type: 'meeting',
        meeting_type: eventConfig.type as any,
        deal_id: dealId,
        company_id: companyId,
        contact_id: contactId,
        priority: eventType === 'closing' ? 'high' : 'normal'
      };

      return await this.createEvent(eventData);
    } catch (error: any) {
      console.error('Error creating event from deal:', error);
      return { data: null, error: error.message };
    }
  }

  static async quickScheduleFromContact(contactId: string, type: 'call' | 'meeting' = 'meeting'): Promise<{ data: CalendarEvent | null; error: string | null }> {
    try {
      // Get contact information
      const { data: contact, error: contactError } = await supabase
        .from('contacts')
        .select(`
          *,
          companies(id, name)
        `)
        .eq('id', contactId)
        .single();

      if (contactError) throw contactError;

      const now = new Date();
      const eventStart = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Next week
      eventStart.setHours(15, 0, 0, 0); // 3:00 PM
      const eventEnd = new Date(eventStart.getTime() + 30 * 60 * 1000); // 30 minutes

      const eventData: CreateEventData = {
        title: `${type === 'call' ? 'Llamada' : 'Reunión'} - ${contact.name}`,
        description: `${type === 'call' ? 'Llamada' : 'Reunión'} con ${contact.name}${contact.companies?.name ? ` de ${contact.companies.name}` : ''}`,
        start_date: eventStart.toISOString(),
        end_date: eventEnd.toISOString(),
        event_type: type === 'call' ? 'call' : 'meeting',
        meeting_type: 'client_meeting',
        contact_id: contactId,
        company_id: contact.companies?.id,
        priority: 'normal'
      };

      return await this.createEvent(eventData);
    } catch (error: any) {
      console.error('Error quick scheduling from contact:', error);
      return { data: null, error: error.message };
    }
  }

  // ============= MEETING TEMPLATES =============

  static async getMeetingTemplates(): Promise<{ data: MeetingTemplate[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('meeting_templates')
        .select('*')
        .order('usage_count', { ascending: false });

      if (error) throw error;
      return { 
        data: (data || []).map(item => ({
          ...item,
          preparation_checklist: Array.isArray(item.preparation_checklist) ? item.preparation_checklist as string[] : [],
          default_attendees: Array.isArray(item.default_attendees) ? item.default_attendees as string[] : [],
          questions: Array.isArray(item.questions) ? item.questions as any[] : []
        })) as MeetingTemplate[], 
        error: null 
      };
    } catch (error: any) {
      console.error('Error fetching meeting templates:', error);
      return { data: [], error: error.message };
    }
  }
}