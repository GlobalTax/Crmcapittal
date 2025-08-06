
import { useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as UICalendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useCalendarMutations } from '@/hooks/useCalendarMutations';
import { EventModal } from '@/components/calendar/EventModal';
import { EventCard } from '@/components/calendar/EventCard';
import { cn } from '@/lib/utils';

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const { events, loading, refetch } = useCalendarEvents(currentMonth);
  const { deleteEvent } = useCalendarMutations();

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleEventEdit = (event: any) => {
    setSelectedEvent(event);
    setEventModalOpen(true);
  };

  const handleEventDelete = async (eventId: string) => {
    const success = await deleteEvent(eventId);
    if (success) {
      refetch();
    }
  };

  const handleEventSaved = () => {
    refetch();
    setSelectedEvent(null);
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500';
      case 'call': return 'bg-green-500';
      case 'task': return 'bg-orange-500';
      case 'appointment': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const todayEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>
          <p className="text-muted-foreground">
            Gestiona tus citas y eventos
          </p>
        </div>
        <Button onClick={() => {
          setSelectedEvent(null);
          setEventModalOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Evento
        </Button>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Vista Calendario
          </TabsTrigger>
          <TabsTrigger value="list">
            <List className="h-4 w-4 mr-2" />
            Vista Lista
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
                      {format(currentMonth, 'MMMM yyyy', { locale: es })}
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleNextMonth}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <UICalendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    className="w-full pointer-events-auto"
                    components={{
                      DayContent: ({ date }) => {
                        const dayEvents = getEventsForDate(date);
                        return (
                          <div className="relative w-full h-full p-1">
                            <div className="text-sm">{date.getDate()}</div>
                            {dayEvents.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {dayEvents.slice(0, 2).map((event, index) => (
                                  <div
                                    key={index}
                                    className={cn(
                                      "w-2 h-2 rounded-full",
                                      getEventTypeColor(event.event_type)
                                    )}
                                  />
                                ))}
                                {dayEvents.length > 2 && (
                                  <div className="text-xs text-muted-foreground">
                                    +{dayEvents.length - 2}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {selectedDate ? format(selectedDate, 'dd MMMM yyyy', { locale: es }) : 'Eventos del día'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </div>
                  ) : todayEvents.length > 0 ? (
                    <div className="space-y-3">
                      {todayEvents.map(event => (
                        <EventCard
                          key={event.id}
                          event={event}
                          compact
                          onEdit={() => handleEventEdit(event)}
                          onDelete={() => handleEventDelete(event.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No hay eventos para este día
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todos los eventos</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : events.length > 0 ? (
                <div className="space-y-4">
                  {events.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onEdit={() => handleEventEdit(event)}
                      onDelete={() => handleEventDelete(event.id)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No tienes eventos programados
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EventModal
        open={eventModalOpen}
        onOpenChange={setEventModalOpen}
        event={selectedEvent}
        onEventSaved={handleEventSaved}
        defaultDate={selectedDate}
      />
    </div>
  );
};

export default Calendar;
