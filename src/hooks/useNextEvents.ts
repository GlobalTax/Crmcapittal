import { useState, useEffect } from 'react';
import { useAuth } from '@/stores/useAuthStore';

interface CalendarEvent {
  id: string;
  subject: string;
  start: string;
  end: string;
  location?: string;
  attendees?: string[];
}

export const useNextEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        // TODO: Implement Microsoft Graph API integration
        // For now, return mock data
        const mockEvents: CalendarEvent[] = [
          {
            id: '1',
            subject: 'Reunión con cliente ABC',
            start: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
            end: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
            location: 'Oficina principal',
          },
          {
            id: '2',
            subject: 'Call de seguimiento - Lead XYZ',
            start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
            end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
            location: 'Videollamada',
          },
          {
            id: '3',
            subject: 'Presentación propuesta',
            start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
            end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
            location: 'Cliente oficina',
          },
        ];

        setEvents(mockEvents);
      } catch (err) {
        console.error('Error fetching calendar events:', err);
        setError(err instanceof Error ? err.message : 'Error fetching events');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchEvents();
    }
  }, [user]);

  return { events, loading, error };
};