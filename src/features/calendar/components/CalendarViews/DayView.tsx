import React from 'react';
import { format, addHours, startOfDay, isSameHour } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarEvent, CalendarViewProps } from '../../types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Users, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

export const DayView: React.FC<CalendarViewProps> = ({
  events,
  selectedDate,
  onEventClick,
  onEventCreate,
  loading
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayStart = startOfDay(selectedDate);

  const getEventsForHour = (hour: number) => {
    return events.filter(event => {
      const eventStart = new Date(event.start_date);
      return isSameHour(eventStart, addHours(dayStart, hour));
    });
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

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'border-l-red-500 bg-red-50 dark:bg-red-950',
      high: 'border-l-orange-500 bg-orange-50 dark:bg-orange-950',
      normal: 'border-l-blue-500 bg-blue-50 dark:bg-blue-950',
      low: 'border-l-gray-500 bg-gray-50 dark:bg-gray-950'
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  };

  const formatEventTime = (event: CalendarEvent) => {
    const start = new Date(event.start_date);
    const end = new Date(event.end_date);
    return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
  };

  const getEventDuration = (event: CalendarEvent) => {
    const start = new Date(event.start_date);
    const end = new Date(event.end_date);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60);
    return `${duration}min`;
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {hours.slice(8, 20).map(hour => (
          <div key={hour} className="h-16 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="text-center py-4 border-b">
        <h2 className="text-xl font-semibold">
          {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: es })}
        </h2>
        <p className="text-sm text-muted-foreground">
          {events.length} eventos programados
        </p>
      </div>

      <div className="space-y-1">
        {hours.map(hour => {
          const hourEvents = getEventsForHour(hour);
          const timeLabel = format(addHours(dayStart, hour), 'HH:mm');
          
          return (
            <div key={hour} className="flex min-h-16 border-b border-border/30">
              {/* Time Column */}
              <div className="w-16 flex-shrink-0 p-2 text-sm text-muted-foreground font-medium">
                {timeLabel}
              </div>
              
              {/* Events Column */}
              <div 
                className="flex-1 p-2 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => onEventCreate(selectedDate, timeLabel)}
              >
                {hourEvents.length === 0 ? (
                  <div className="h-12 flex items-center justify-center text-muted-foreground/50 text-xs">
                    Click para agregar evento
                  </div>
                ) : (
                  <div className="space-y-2">
                    {hourEvents.map(event => (
                      <Card
                        key={event.id}
                        className={cn(
                          "p-3 cursor-pointer hover:shadow-md transition-all duration-200 border-l-4",
                          getPriorityColor(event.priority)
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge 
                                className={cn("text-xs", getEventTypeColor(event))}
                                variant="default"
                              >
                                {event.event_type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {getEventDuration(event)}
                              </span>
                              {event.priority === 'urgent' && (
                                <Badge variant="destructive" className="text-xs">
                                  URGENTE
                                </Badge>
                              )}
                            </div>
                            
                            <h4 className="font-medium text-sm truncate mb-1">
                              {event.title}
                            </h4>
                            
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatEventTime(event)}
                              </div>
                              
                              {event.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate max-w-24">
                                    {event.location}
                                  </span>
                                </div>
                              )}
                              
                              {event.video_meeting_url && (
                                <div className="flex items-center gap-1">
                                  <Video className="w-3 h-3" />
                                  <span>Video</span>
                                </div>
                              )}
                              
                              {event.attendees && event.attendees.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  <span>{event.attendees.length}</span>
                                </div>
                              )}
                            </div>
                            
                            {event.description && (
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};