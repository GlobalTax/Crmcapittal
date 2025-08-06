import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNextEvents } from '@/hooks/useNextEvents';
import { Calendar, Plus, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { EventModal } from '@/components/calendar/EventModal';

interface PanelCalendarioProps {
  className?: string;
}

export const PanelCalendario = ({ className }: PanelCalendarioProps) => {
  const { events, loading } = useNextEvents();
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleNewMeeting = () => {
    setEventModalOpen(true);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="section-title flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Próximos Eventos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleNewMeeting}
          className="w-full"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Reunión
        </Button>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 border rounded-lg animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2" />
              <p>No hay eventos próximos</p>
              <p className="text-xs">Tu calendario está libre</p>
            </div>
          ) : (
            events.slice(0, 5).map((event, index) => (
              <div key={index} className="p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground truncate">
                      {event.subject || 'Sin título'}
                    </h4>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {event.start ? format(new Date(event.start), 'HH:mm', { locale: es }) : 'Hora no definida'}
                      </span>
                    </div>
                    {event.location && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        📍 {event.location}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground ml-2">
                    {event.start ? format(new Date(event.start), 'dd MMM', { locale: es }) : ''}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {events.length > 5 && (
          <Button 
            variant="ghost" 
            className="w-full text-sm"
            onClick={() => navigate('/calendar')}
          >
            Ver todos los eventos ({events.length})
          </Button>
        )}
      </CardContent>

      <EventModal
        open={eventModalOpen}
        onOpenChange={setEventModalOpen}
        onEventSaved={() => {
          // Refresh events if needed
        }}
      />
    </Card>
  );
};