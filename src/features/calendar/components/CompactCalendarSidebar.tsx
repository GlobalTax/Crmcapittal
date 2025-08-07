import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin,
  Building,
  Target,
  User
} from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { useUpcomingEvents } from '@/hooks/useCalendarEvents';
import { EventModal } from '@/components/calendar/EventModal';

export const CompactCalendarSidebar: React.FC = () => {
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const { events: todayEvents, loading } = useUpcomingEvents(3);
  const { events: weekEvents } = useUpcomingEvents(20);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'call': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'task': return 'bg-orange-500/10 text-orange-700 border-orange-200';
      case 'appointment': return 'bg-purple-500/10 text-purple-700 border-purple-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getCrmBadge = (event: any) => {
    if (event.lead_name) {
      return (
        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
          <Target className="h-2.5 w-2.5 mr-1" />
          {event.lead_name}
        </Badge>
      );
    }
    if (event.mandate_name) {
      return (
        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
          <Building className="h-2.5 w-2.5 mr-1" />
          {event.mandate_name}
        </Badge>
      );
    }
    return null;
  };

  const getWeekDistribution = () => {
    const startWeek = startOfWeek(new Date(), { locale: es });
    const days = Array.from({ length: 7 }, (_, i) => {
      const day = addDays(startWeek, i);
      const dayEvents = weekEvents.filter(event => {
        const eventDate = new Date(event.start_date);
        return eventDate.toDateString() === day.toDateString();
      });
      return {
        date: day,
        events: dayEvents,
        count: dayEvents.length
      };
    });
    return days;
  };

  const weekDays = getWeekDistribution();
  const lastContact = "Tech Corp"; // This would come from CRM context

  return (
    <div className="w-80 border-r bg-muted/20 p-4 flex flex-col h-full space-y-4">
      {/* Quick Create */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            className="w-full justify-start"
            onClick={() => setEventModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Evento
          </Button>
          <Button 
            variant="outline"
            className="w-full justify-start text-sm"
            onClick={() => setEventModalOpen(true)}
          >
            <Building className="h-4 w-4 mr-2" />
            Reunión con {lastContact}
          </Button>
        </CardContent>
      </Card>

      {/* Hoy */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Hoy
            <Badge variant="secondary" className="ml-2">
              {todayEvents.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : todayEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay eventos para hoy
            </p>
          ) : (
            <div className="space-y-2">
              {todayEvents.map((event) => (
                <div 
                  key={event.id}
                  className="p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{event.title}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(event.start_date), 'HH:mm')}
                        {event.location && (
                          <>
                            <MapPin className="h-3 w-3 ml-1" />
                            <span className="truncate">{event.location}</span>
                          </>
                        )}
                      </div>
                      {getCrmBadge(event) && (
                        <div className="mt-1">
                          {getCrmBadge(event)}
                        </div>
                      )}
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getEventTypeColor(event.event_type)}`}
                    >
                      {event.event_type === 'meeting' ? '🤝' : 
                       event.event_type === 'call' ? '📞' : 
                       event.event_type === 'task' ? '✅' : '📅'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Esta semana */}
      <Card className="flex-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Esta Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {weekDays.map((day, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 rounded hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground uppercase">
                      {format(day.date, 'EEE', { locale: es })}
                    </div>
                    <div className={`text-sm font-medium ${
                      day.date.toDateString() === new Date().toDateString() 
                        ? 'text-primary font-bold' 
                        : ''
                    }`}>
                      {format(day.date, 'd')}
                    </div>
                  </div>
                  <div className="flex-1">
                    {day.count > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {day.events.slice(0, 2).map((event, idx) => (
                          <div 
                            key={idx}
                            className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary truncate max-w-20"
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                        {day.count > 2 && (
                          <div className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            +{day.count - 2}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Libre</span>
                    )}
                  </div>
                </div>
                {day.count > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {day.count}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CRM Shortcuts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground">CRM Rápido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
            <Building className="h-3 w-3 mr-2" />
            Deals Activos (3)
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
            <Target className="h-3 w-3 mr-2" />
            Leads Calientes (5)
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
            <Clock className="h-3 w-3 mr-2" />
            Pendientes (2)
          </Button>
        </CardContent>
      </Card>

      <EventModal
        open={eventModalOpen}
        onOpenChange={setEventModalOpen}
        onEventSaved={() => {
          // Refresh events if needed
        }}
      />
    </div>
  );
};