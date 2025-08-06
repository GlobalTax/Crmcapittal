import { useUpcomingEvents } from './useCalendarEvents';

export const useNextEvents = () => {
  const { events: calendarEvents, loading, error } = useUpcomingEvents(5);
  
  // Transform calendar events to match the expected interface
  const events = calendarEvents.map(event => ({
    id: event.id,
    subject: event.title,
    start: event.start_date,
    end: event.end_date,
    location: event.location || undefined,
    attendees: event.attendees || undefined,
  }));

  return { events, loading, error };
};