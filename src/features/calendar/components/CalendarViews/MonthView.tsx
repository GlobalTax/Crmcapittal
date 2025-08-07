import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarViewProps, CalendarEvent } from '../../types';
import { cn } from '@/lib/utils';

export function MonthView({ 
  events, 
  selectedDate, 
  onDateChange, 
  onEventClick, 
  onEventCreate, 
  loading 
}: CalendarViewProps) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const getEventsForDay = (day: Date): CalendarEvent[] => {
    return events.filter(event => 
      isSameDay(new Date(event.start_date), day)
    );
  };

  const getEventTypeColor = (event: CalendarEvent): string => {
    switch (event.meeting_type) {
      case 'demo': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'follow_up': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'closing': return 'bg-purple-500/10 text-purple-700 border-purple-200';
      case 'negotiation': return 'bg-orange-500/10 text-orange-700 border-orange-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 42 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header del mes */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {format(selectedDate, 'MMMM yyyy', { locale: es })}
        </h2>
        <div className="text-sm text-muted-foreground">
          {events.length} eventos este mes
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendario */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(day => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, selectedDate);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);

          return (
            <Card
              key={day.toISOString()}
              className={cn(
                "min-h-[120px] cursor-pointer hover:shadow-md transition-shadow",
                !isCurrentMonth && "opacity-50",
                isSelected && "ring-2 ring-primary",
                isCurrentDay && "bg-primary/5"
              )}
              onClick={() => onDateChange?.(day)}
            >
              <CardContent className="p-2 h-full">
                <div className="flex flex-col h-full">
                  {/* Número del día */}
                  <div className={cn(
                    "text-sm font-medium mb-1",
                    isCurrentDay && "text-primary font-bold"
                  )}>
                    {format(day, 'd')}
                  </div>

                  {/* Eventos */}
                  <div className="flex-1 space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className={cn(
                          "text-xs p-1 rounded border truncate cursor-pointer hover:opacity-80",
                          getEventTypeColor(event)
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                        title={`${event.title} - ${format(new Date(event.start_date), 'HH:mm')}`}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="opacity-75">
                          {format(new Date(event.start_date), 'HH:mm')}
                        </div>
                      </div>
                    ))}
                    
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground px-1">
                        +{dayEvents.length - 3} más
                      </div>
                    )}
                  </div>

                  {/* Botón para agregar evento */}
                  {dayEvents.length === 0 && (
                    <div 
                      className="text-xs text-muted-foreground text-center py-2 hover:text-primary cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventCreate?.(day);
                      }}
                    >
                      + Agregar evento
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-200">
            Demo
          </Badge>
          <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200">
            Seguimiento
          </Badge>
          <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-200">
            Cierre
          </Badge>
          <Badge variant="outline" className="bg-orange-500/10 text-orange-700 border-orange-200">
            Negociación
          </Badge>
        </div>
      </div>
    </div>
  );
}