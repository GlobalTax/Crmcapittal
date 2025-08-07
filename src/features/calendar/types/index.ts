// Calendar Types - Enhanced CRM-first calendar system

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  location?: string;
  attendees?: string[];
  status: 'confirmed' | 'tentative' | 'cancelled';
  event_type: 'meeting' | 'call' | 'task' | 'appointment' | 'follow_up' | 'demo' | 'closing' | 'event' | 'deadline' | 'reminder';
  
  // CRM Integration
  deal_id?: string;
  company_id?: string;
  contact_id?: string;
  lead_id?: string;
  mandate_id?: string;
  
  // Enhanced fields
  meeting_type: 'general' | 'client_meeting' | 'demo' | 'follow_up' | 'negotiation' | 'closing' | 'internal';
  meeting_outcome?: string;
  preparation_notes?: string;
  follow_up_required: boolean;
  
  // Technical fields
  calendar_provider?: string;
  external_event_id?: string;
  travel_time_minutes: number;
  video_meeting_url?: string;
  booking_link_id?: string;
  is_recurring: boolean;
  recurrence_rule?: string;
  time_zone: string;
  reminder_minutes: number;
  is_all_day: boolean;
  visibility: 'private' | 'public' | 'confidential';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  created_at: string;
  updated_at: string;
}

export interface BookingLink {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  duration_minutes: number;
  buffer_time_before: number;
  buffer_time_after: number;
  advance_notice_hours: number;
  max_advance_days: number;
  availability_schedule: AvailabilitySchedule;
  meeting_location?: string;
  video_meeting_enabled: boolean;
  questions: BookingQuestion[];
  is_active: boolean;
  booking_limit_per_day?: number;
  slug: string;
  redirect_url?: string;
  confirmation_message?: string;
  requires_approval: boolean;
  created_at: string;
  updated_at: string;
}

export interface AvailabilitySchedule {
  monday?: TimeSlot[];
  tuesday?: TimeSlot[];
  wednesday?: TimeSlot[];
  thursday?: TimeSlot[];
  friday?: TimeSlot[];
  saturday?: TimeSlot[];
  sunday?: TimeSlot[];
  timezone?: string;
  date_overrides?: { [date: string]: TimeSlot[] | 'unavailable' };
}

export interface TimeSlot {
  start?: string; // HH:mm format
  end?: string; // HH:mm format
}

export interface BookingQuestion {
  id?: string;
  question?: string;
  type?: 'text' | 'email' | 'phone' | 'select' | 'textarea';
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

export interface Booking {
  id: string;
  booking_link_id: string;
  event_id?: string;
  booker_name: string;
  booker_email: string;
  booker_phone?: string;
  company_name?: string;
  booking_notes?: string;
  answers: { [questionId: string]: string | string[] };
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  confirmation_token?: string;
  cancelled_reason?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AvailabilityPattern {
  id: string;
  user_id: string;
  pattern_name: string;
  pattern_data: AvailabilitySchedule;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CalendarAnalytics {
  id: string;
  user_id: string;
  event_id?: string;
  metric_type: 'meeting_scheduled' | 'meeting_completed' | 'no_show' | 'rescheduled' | 'cancelled';
  metric_date: string;
  meeting_type?: string;
  duration_minutes?: number;
  source: 'manual' | 'booking_link' | 'crm_integration';
  outcome?: string;
  follow_up_created: boolean;
  deal_progression: boolean;
  created_at: string;
}

export interface CalendarIntegration {
  id: string;
  user_id: string;
  provider: 'google' | 'outlook' | 'apple';
  account_email: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  calendar_id?: string;
  sync_enabled: boolean;
  last_sync_at?: string;
  sync_status: 'active' | 'error' | 'disabled';
  sync_error?: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  meeting_type: string;
  agenda_template?: string;
  preparation_checklist: string[];
  follow_up_template?: string;
  default_attendees: string[];
  location_template?: string;
  questions: BookingQuestion[];
  is_shared: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

// View Types
export type CalendarView = 'day' | 'week' | 'month' | 'agenda' | 'timeline' | 'pipeline';

export interface CalendarViewProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onEventCreate: (date: Date, time?: string) => void;
  loading?: boolean;
}

export interface TimelineEvent extends CalendarEvent {
  duration: number;
  gap: number;
}

export interface PipelineGroup {
  type: 'deal' | 'contact' | 'company';
  id: string;
  name: string;
  title: string;
  subtitle?: string;
  events: CalendarEvent[];
  status?: string;
  value?: number;
  totalEvents: number;
  nextEvent?: CalendarEvent;
}

// Analytics Types
export interface CalendarMetrics {
  total_meetings: number;
  total_events: number;
  total_hours: number;
  average_meeting_duration: number;
  average_duration_minutes: number;
  meetings_by_type: { [type: string]: number };
  meeting_type_breakdown: { [type: string]: number };
  conversion_rates: {
    demo_to_deal: number;
    meeting_to_follow_up: number;
    follow_up_to_close: number;
  };
  optimal_times: {
    best_day: string;
    best_hour: number;
    response_rates: { [hour: string]: number };
  };
  booking_sources: {
    manual: number;
    booking_link: number;
    crm_integration: number;
  };
  no_show_rate: number;
  dailyStats: { [date: string]: { totalHours: number; eventCount: number } };
  completedEvents: number;
  totalEvents: number;
  averageAttendees: number;
  demoCount: number;
  followUpCount: number;
  closingCount: number;
  recentActivity: Array<{
    title: string;
    type: string;
    date: string;
    status: string;
  }>;
}

// Smart Scheduling Types
export interface SchedulingSuggestion {
  type: 'follow_up' | 'demo' | 'check_in' | 'closing';
  suggested_date: string;
  suggested_time: string;
  reason: string;
  confidence: number;
  related_entity: {
    type: 'deal' | 'contact' | 'company';
    id: string;
    name: string;
  };
}

export interface TravelTimeConfig {
  enabled: boolean;
  default_minutes: number;
  use_maps_api: boolean;
  api_key?: string;
}

// Create/Update Types
export interface CreateEventData {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  location?: string;
  attendees?: string[];
  event_type: CalendarEvent['event_type'];
  meeting_type?: CalendarEvent['meeting_type'];
  deal_id?: string;
  company_id?: string;
  contact_id?: string;
  lead_id?: string;
  mandate_id?: string;
  preparation_notes?: string;
  follow_up_required?: boolean;
  travel_time_minutes?: number;
  video_meeting_url?: string;
  is_recurring?: boolean;
  recurrence_rule?: string;
  reminder_minutes?: number;
  is_all_day?: boolean;
  visibility?: CalendarEvent['visibility'];
  priority?: CalendarEvent['priority'];
  status?: CalendarEvent['status'];
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string;
  meeting_outcome?: string;
}

export interface CreateBookingLinkData {
  title: string;
  description?: string;
  duration_minutes: number;
  buffer_time_before?: number;
  buffer_time_after?: number;
  advance_notice_hours?: number;
  max_advance_days?: number;
  availability_schedule: AvailabilitySchedule;
  meeting_location?: string;
  video_meeting_enabled?: boolean;
  questions?: BookingQuestion[];
  booking_limit_per_day?: number;
  redirect_url?: string;
  confirmation_message?: string;
  requires_approval?: boolean;
}

export interface UpdateBookingLinkData extends Partial<CreateBookingLinkData> {
  id: string;
}

// Filter Types
export interface CalendarFilter {
  start_date?: string;
  end_date?: string;
  event_types?: CalendarEvent['event_type'][];
  event_type?: CalendarEvent['event_type'][];
  meeting_types?: CalendarEvent['meeting_type'][];
  priorities?: CalendarEvent['priority'][];
  priority?: CalendarEvent['priority'][];
  status?: CalendarEvent['status'][];
  deal_id?: string;
  company_id?: string;
  contact_id?: string;
  search?: string;
}