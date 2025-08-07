import React, { useState } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Building, Target, MapPin, Clock } from 'lucide-react';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { EventCrmPanel } from './EventCrmPanel';
import { cn } from '@/lib/utils';

export const CrmWeekView: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  const { events, loading } = useCalendarEvents(currentWeek);

  const weekStart = startOfWeek(currentWeek, { locale: es });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 8 PM

  const getEventsForDateAndHour = (date: Date, hour: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_date);
      const eventHour = eventDate.getHours();
      return isSameDay(eventDate, date) && eventHour === hour;
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500 text-white border-blue-600';
      case 'call': return 'bg-green-500 text-white border-green-600';
      case 'task': return 'bg-orange-500 text-white border-orange-600';
      case 'appointment': return 'bg-purple-500 text-white border-purple-600';
      default: return 'bg-gray-500 text-white border-gray-600';
    }
  };

  const getCrmIcon = (event: any) => {
    if (event.lead_name) return <Target className="h-3 w-3" />;
    if (event.mandate_name) return <Building className="h-3 w-3" />;
    return null;
  };

  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">
                Semana del {format(weekStart, 'dd MMM', { locale: es })} - {format(addDays(weekStart, 6), 'dd MMM yyyy', { locale: es })}
              </h2>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleNextWeek}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Reuniones</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Llamadas</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span>Tareas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Week Grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-8 min-h-full">
            {/* Time column */}
            <div className="border-r bg-muted/20">
              <div className="h-12 border-b bg-muted/40"></div>
              {hours.map(hour => (
                <div key={hour} className="h-16 border-b flex items-start justify-center pt-1 text-xs text-muted-foreground">
                  {format(new Date().setHours(hour, 0), 'HH:mm')}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, dayIndex) => (
              <div key={dayIndex} className="border-r">
                {/* Day header */}
                <div className={cn(
                  "h-12 border-b bg-muted/20 flex flex-col items-center justify-center",
                  isToday(day) && "bg-primary/10 border-primary/20"
                )}>
                  <div className="text-xs text-muted-foreground uppercase">
                    {format(day, 'EEE', { locale: es })}
                  </div>
                  <div className={cn(
                    "text-sm font-medium",
                    isToday(day) && "text-primary font-bold"
                  )}>
                    {format(day, 'd')}
                  </div>
                </div>

                {/* Hour slots */}
                {hours.map(hour => {
                  const dayEvents = getEventsForDateAndHour(day, hour);
                  return (
                    <div key={hour} className="h-16 border-b relative p-1">
                      {dayEvents.map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          onClick={() => handleEventClick(event)}
                          className={cn(
                            "absolute inset-x-1 rounded text-xs p-1 cursor-pointer hover:shadow-md transition-shadow",
                            getEventTypeColor(event.event_type),
                            "top-1 h-14 overflow-hidden"
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{event.title}</div>
                              <div className="flex items-center gap-1 text-xs opacity-90">
                                <Clock className="h-2.5 w-2.5" />
                                {format(new Date(event.start_date), 'HH:mm')}
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1 text-xs opacity-90">
                                  <MapPin className="h-2.5 w-2.5" />
                                  <span className="truncate">{event.location}</span>
                                </div>
                              )}
                              {(event.lead_name || event.mandate_name) && (
                                <div className="flex items-center gap-1 text-xs opacity-90">
                                  {getCrmIcon(event)}
                                  <span className="truncate">
                                    {event.lead_name || event.mandate_name}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CRM Context Panel */}
      {selectedEvent && (
        <EventCrmPanel
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};