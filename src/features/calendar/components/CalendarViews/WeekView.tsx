import React from 'react';
import { format, addDays, startOfWeek, isSameDay, addHours, startOfDay, isSameHour } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarEvent, CalendarViewProps } from '../../types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export const WeekView: React.FC<CalendarViewProps> = ({
  events,
  selectedDate,
  onDateChange,
  onEventClick,
  onEventCreate,
  loading
}) => {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 10 PM

  const getEventsForDayAndHour = (day: Date, hour: number) => {
    return events.filter(event => {
      const eventStart = new Date(event.start_date);
      return isSameDay(eventStart, day) && isSameHour(eventStart, addHours(startOfDay(day), hour));
    });
  };

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(new Date(event.start_date), day));
  };

  const getEventTypeColor = (event: CalendarEvent) => {
    const colors = {
      meeting: 'bg-blue-500',
      call: 'bg-green-500',
      task: 'bg-orange-500',
      appointment: 'bg-purple-500',
      follow_up: 'bg-pink-500',
      demo: 'bg-indigo-500',
      closing: 'bg-red-500'
    };
    return colors[event.event_type] || 'bg-gray-500';
  };

  const isToday = (date: Date) => isSameDay(date, new Date());
  const isSelected = (date: Date) => isSameDay(date, selectedDate);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-8 gap-2">
          <div className="h-8 bg-muted rounded animate-pulse" />
          {weekDays.map((_, i) => (
            <div key={i} className="h-8 bg-muted rounded animate-pulse" />
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="grid grid-cols-8 gap-2">
              <div className="h-12 bg-muted rounded animate-pulse" />
              {weekDays.map((_, j) => (
                <div key={j} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Week Header */}
      <div className="text-center py-4 border-b">
        <h2 className="text-xl font-semibold">
          {format(weekStart, 'd MMM', { locale: es })} - {format(addDays(weekStart, 6), 'd MMM yyyy', { locale: es })}
        </h2>
        <p className="text-sm text-muted-foreground">
          {events.length} eventos esta semana
        </p>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-8 gap-2">
        <div className="h-8" /> {/* Empty cell for time column */}
        {weekDays.map(day => {
          const dayEvents = getEventsForDay(day);
          return (
            <Card
              key={day.toISOString()}
              className={cn(
                "p-2 text-center cursor-pointer hover:bg-muted/50 transition-colors",
                isToday(day) && "bg-primary text-primary-foreground",
                isSelected(day) && "ring-2 ring-primary"
              )}
              onClick={() => onDateChange(day)}
            >
              <div className="text-xs font-medium">
                {format(day, 'EEE', { locale: es })}
              </div>
              <div className={cn(
                "text-lg font-semibold",
                isToday(day) ? "text-primary-foreground" : "text-foreground"
              )}>
                {format(day, 'd')}
              </div>
              {dayEvents.length > 0 && (
                <div className="text-xs opacity-75 mt-1">
                  {dayEvents.length} eventos
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Week Grid */}
      <div className="space-y-1">
        {hours.map(hour => {
          const timeLabel = format(new Date().setHours(hour, 0, 0, 0), 'HH:mm');
          
          return (
            <div key={hour} className="grid grid-cols-8 gap-2 min-h-16">
              {/* Time Column */}
              <div className="p-2 text-sm text-muted-foreground font-medium text-right">
                {timeLabel}
              </div>
              
              {/* Day Columns */}
              {weekDays.map(day => {
                const hourEvents = getEventsForDayAndHour(day, hour);
                
                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="border border-border/30 p-1 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => onEventCreate(day, timeLabel)}
                  >
                    {hourEvents.length === 0 ? (
                      <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {hourEvents.map(event => (
                          <Card
                            key={event.id}
                            className={cn(
                              "p-1 cursor-pointer hover:shadow-md transition-all duration-200 border-l-2",
                              getEventTypeColor(event)
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(event);
                            }}
                          >
                            <div className="text-xs text-white font-medium truncate">
                              {event.title}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-white/80">
                              <Clock className="w-2 h-2" />
                              {format(new Date(event.start_date), 'HH:mm')}
                            </div>
                            {event.priority === 'urgent' && (
                              <Badge variant="destructive" className="text-xs mt-1">
                                !
                              </Badge>
                            )}
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};