import React from 'react';
import { format, startOfDay, addMinutes, differenceInMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Users } from 'lucide-react';
import { CalendarViewProps, CalendarEvent, TimelineEvent } from '../../types';
import { cn } from '@/lib/utils';

export function TimelineView({ 
  events, 
  selectedDate, 
  onEventClick, 
  onEventCreate, 
  loading 
}: CalendarViewProps) {
  
  const processEventsForTimeline = (): TimelineEvent[] => {
    const dayStart = startOfDay(selectedDate);
    const sortedEvents = events
      .filter(event => format(new Date(event.start_date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

    return sortedEvents.map((event, index) => {
      const startTime = new Date(event.start_date);
      const endTime = new Date(event.end_date);
      const duration = differenceInMinutes(endTime, startTime);
      
      // Calcular gap con el evento anterior
      let gap = 0;
      if (index > 0) {
        const previousEvent = sortedEvents[index - 1];
        const previousEndTime = new Date(previousEvent.end_date);
        gap = differenceInMinutes(startTime, previousEndTime);
      } else {
        // Gap desde el inicio del día
        gap = differenceInMinutes(startTime, dayStart);
      }

      return {
        ...event,
        duration,
        gap
      };
    });
  };

  const getEventTypeColor = (event: CalendarEvent): string => {
    switch (event.meeting_type) {
      case 'demo': return 'border-l-blue-500 bg-blue-50';
      case 'follow_up': return 'border-l-green-500 bg-green-50';
      case 'closing': return 'border-l-purple-500 bg-purple-50';
      case 'negotiation': return 'border-l-orange-500 bg-orange-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatGap = (minutes: number): string => {
    if (minutes < 60) return `${minutes}min gap`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min gap` : `${hours}h gap`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  const timelineEvents = processEventsForTimeline();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Timeline - {format(selectedDate, 'd MMMM yyyy', { locale: es })}
          </h2>
          <p className="text-sm text-muted-foreground">
            Vista cronológica con tiempos entre eventos
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {timelineEvents.length} eventos programados
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Línea de tiempo vertical */}
        <div className="absolute left-12 top-0 bottom-0 w-px bg-border"></div>

        <div className="space-y-6">
          {timelineEvents.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="p-8 text-center">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay eventos programados</h3>
                <p className="text-muted-foreground mb-4">
                  Comienza agregando tu primer evento del día
                </p>
                <button
                  onClick={() => onEventCreate?.(selectedDate)}
                  className="text-primary hover:underline"
                >
                  + Crear evento
                </button>
              </CardContent>
            </Card>
          ) : (
            timelineEvents.map((event, index) => (
              <div key={event.id} className="relative">
                {/* Gap indicator */}
                {event.gap > 0 && (
                  <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
                    <div className="w-12 text-right">
                      {index === 0 
                        ? format(startOfDay(selectedDate), 'HH:mm')
                        : format(addMinutes(new Date(timelineEvents[index - 1].end_date), 0), 'HH:mm')
                      }
                    </div>
                    <div className="relative">
                      <div className="w-3 h-3 rounded-full bg-gray-300 border-2 border-white"></div>
                    </div>
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {formatGap(event.gap)}
                    </div>
                    {event.gap > 60 && (
                      <button
                        onClick={() => onEventCreate?.(addMinutes(new Date(timelineEvents[index - 1]?.end_date || startOfDay(selectedDate)), event.gap / 2))}
                        className="text-xs text-primary hover:underline"
                      >
                        + Agregar evento en gap
                      </button>
                    )}
                  </div>
                )}

                {/* Event */}
                <div className="flex items-start gap-3">
                  {/* Time */}
                  <div className="w-12 text-right text-sm font-medium">
                    {format(new Date(event.start_date), 'HH:mm')}
                  </div>

                  {/* Timeline dot */}
                  <div className="relative">
                    <div className={cn(
                      "w-3 h-3 rounded-full border-2 border-white",
                      event.meeting_type === 'demo' && "bg-blue-500",
                      event.meeting_type === 'follow_up' && "bg-green-500",
                      event.meeting_type === 'closing' && "bg-purple-500",
                      event.meeting_type === 'negotiation' && "bg-orange-500",
                      !event.meeting_type && "bg-gray-500"
                    )}></div>
                  </div>

                  {/* Event card */}
                  <Card 
                    className={cn(
                      "flex-1 cursor-pointer hover:shadow-md transition-shadow border-l-4",
                      getEventTypeColor(event)
                    )}
                    onClick={() => onEventClick?.(event)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {format(new Date(event.start_date), 'HH:mm')} - {format(new Date(event.end_date), 'HH:mm')}
                              <span className="ml-2 text-xs">({event.duration} min)</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className={getPriorityColor(event.priority || 'normal')}>
                            {event.priority || 'normal'}
                          </Badge>
                          <Badge variant="secondary">
                            {event.meeting_type || 'general'}
                          </Badge>
                        </div>
                      </div>

                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm">
                        {event.location && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        
                        {event.attendees && event.attendees.length > 0 && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{event.attendees.length} asistentes</span>
                          </div>
                        )}

                        {event.travel_time_minutes && event.travel_time_minutes > 0 && (
                          <div className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                            {event.travel_time_minutes}min viaje
                          </div>
                        )}
                      </div>

                      {event.preparation_notes && (
                        <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                          <strong>Preparación:</strong> {event.preparation_notes}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))
          )}

          {/* End of day */}
          {timelineEvents.length > 0 && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="w-12 text-right">
                {format(new Date(timelineEvents[timelineEvents.length - 1].end_date), 'HH:mm')}
              </div>
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-gray-300 border-2 border-white"></div>
              </div>
              <div className="text-xs">
                Fin del día programado
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}