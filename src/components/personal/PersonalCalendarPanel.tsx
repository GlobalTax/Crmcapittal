import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/minimal/Button';
import { Calendar, Plus, Clock, MapPin } from 'lucide-react';
import { useUpcomingEvents } from '@/hooks/useCalendarEvents';
import { EventModal } from '@/components/calendar/EventModal';

export const PersonalCalendarPanel = () => {
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const { events, loading, error } = useUpcomingEvents(3);

  const handleNewMeeting = () => {
    setEventModalOpen(true);
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return '🤝';
      case 'call': return '📞';
      case 'task': return '✅';
      case 'appointment': return '📅';
      default: return '📅';
    }
  };

  return (
    <>
      <DashboardCard title="Próximos Eventos" icon={Calendar}>
        <div className="space-y-3">
          <Button 
            variant="secondary" 
            className="w-full"
            onClick={handleNewMeeting}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Reunión
          </Button>
          
          {loading ? (
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="space-y-2">
              {events.map(event => (
                <div key={event.id} className="p-2 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors">
                  <div className="flex items-start space-x-2">
                    <span className="text-sm">{getEventTypeIcon(event.event_type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{event.title}</p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(event.start_date), 'HH:mm', { locale: es })}</span>
                        {event.location && (
                          <>
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{event.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No hay eventos próximos"
              subtitle="Tu calendario está libre"
            />
          )}
        </div>
      </DashboardCard>

      <EventModal
        open={eventModalOpen}
        onOpenChange={setEventModalOpen}
        onEventSaved={() => {
          // Refresh events if needed
        }}
      />
    </>
  );
};