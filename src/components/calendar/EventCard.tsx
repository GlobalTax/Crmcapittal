import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, MapPin, Edit, Trash2 } from 'lucide-react';
import { CalendarEvent } from '@/hooks/useCalendarEvents';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: CalendarEvent;
  onEdit?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

export const EventCard = ({ event, onEdit, onDelete, compact = false }: EventCardProps) => {
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'call': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'task': return 'bg-orange-500/10 text-orange-700 border-orange-200';
      case 'appointment': return 'bg-purple-500/10 text-purple-700 border-purple-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
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

  const formatTime = (date: string) => {
    return format(new Date(date), 'HH:mm', { locale: es });
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMM', { locale: es });
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-3 p-2 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors">
        <div className="text-lg">{getEventTypeIcon(event.event_type)}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{event.title}</p>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatTime(event.start_date)} - {formatTime(event.end_date)}</span>
            {event.location && (
              <>
                <MapPin className="h-3 w-3 ml-2" />
                <span className="truncate">{event.location}</span>
              </>
            )}
          </div>
        </div>
        <Badge variant="secondary" className={cn("text-xs", getEventTypeColor(event.event_type))}>
          {event.event_type}
        </Badge>
      </div>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">{getEventTypeIcon(event.event_type)}</span>
              <h3 className="font-semibold">{event.title}</h3>
              <Badge variant="secondary" className={getEventTypeColor(event.event_type)}>
                {event.event_type}
              </Badge>
            </div>
            
            {event.description && (
              <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
            )}
            
            <div className="space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-2" />
                <span>
                  {formatDate(event.start_date)} · {formatTime(event.start_date)} - {formatTime(event.end_date)}
                </span>
              </div>
              
              {event.location && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex space-x-1 ml-2">
            {onEdit && (
              <Button size="sm" variant="ghost" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button size="sm" variant="ghost" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};