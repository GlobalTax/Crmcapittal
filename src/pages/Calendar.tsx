
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
      case 'meeting': return 'bg-gradient-to-r from-blue-500 to-blue-600';
      case 'call': return 'bg-gradient-to-r from-green-500 to-green-600';
      case 'task': return 'bg-gradient-to-r from-orange-500 to-orange-600';
      case 'appointment': return 'bg-gradient-to-r from-purple-500 to-purple-600';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const todayEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Calendario</h1>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => {
              setSelectedEvent(null);
              setEventModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Nuevo Evento
          </Button>
        </div>
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

        <TabsContent value="calendar" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-card via-card to-surface-variant overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent capitalize">
                      {format(currentMonth, 'MMMM yyyy', { locale: es })}
                    </CardTitle>
                    <div className="flex space-x-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handlePreviousMonth}
                        className="hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleNextMonth}
                        className="hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <UICalendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    className="w-full pointer-events-auto border-0"
                    components={{
                      DayContent: ({ date }) => {
                        const dayEvents = getEventsForDate(date);
                        const isToday = date.toDateString() === new Date().toDateString();
                        const isSelected = selectedDate?.toDateString() === date.toDateString();
                        
                        return (
                          <div className="relative w-full h-full flex flex-col items-center justify-start p-1">
                            <div className={cn(
                              "text-sm font-medium mb-1",
                              isToday && "font-bold",
                              isSelected && "text-primary-foreground"
                            )}>
                              {date.getDate()}
                            </div>
                            {dayEvents.length > 0 && (
                              <div className="flex flex-wrap gap-0.5 justify-center">
                                {dayEvents.slice(0, 3).map((event, index) => (
                                  <div
                                    key={index}
                                    className={cn(
                                      "w-1.5 h-1.5 rounded-full shadow-sm",
                                      getEventTypeColor(event.event_type)
                                    )}
                                    title={event.title}
                                  />
                                ))}
                                {dayEvents.length > 3 && (
                                  <div className="text-[10px] text-muted-foreground font-medium bg-muted/50 rounded-full px-1 leading-none">
                                    +{dayEvents.length - 3}
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

            <div className="space-y-6">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-surface to-surface-variant">
                <CardHeader className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-b border-border/50">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-primary to-accent rounded-full"></div>
                    {selectedDate ? format(selectedDate, 'dd MMMM yyyy', { locale: es }) : 'Eventos del día'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {loading ? (
                    <div className="space-y-3">
                      <div className="h-16 bg-gradient-to-r from-muted via-muted/50 to-muted rounded-xl animate-pulse" />
                      <div className="h-16 bg-gradient-to-r from-muted via-muted/50 to-muted rounded-xl animate-pulse" />
                    </div>
                  ) : todayEvents.length > 0 ? (
                    <div className="space-y-4">
                      {todayEvents.map(event => (
                        <div key={event.id} className="animate-fade-in">
                          <EventCard
                            event={event}
                            compact
                            onEdit={() => handleEventEdit(event)}
                            onDelete={() => handleEventDelete(event.id)}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-muted via-muted/50 to-muted/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <CalendarIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-sm">
                        No hay eventos para este día
                      </p>
                    </div>
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
