import React, { useState } from 'react';
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Filter,
  Settings,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Views
import { DayView } from './CalendarViews/DayView';
import { WeekView } from './CalendarViews/WeekView';
import { MonthView } from './CalendarViews/MonthView';
import { TimelineView } from './CalendarViews/TimelineView';
import { PipelineView } from './CalendarViews/PipelineView';

// Components
import { BookingLinkManager } from './BookingLinks/BookingLinkManager';
import { CalendarAnalytics } from './CalendarAnalytics';
import { EventForm } from './EventForm';

// Hooks
import { useCalendarEvents, useCalendarMutations } from '../hooks/useCalendar';
import { CalendarView, CalendarEvent, CalendarFilter } from '../types';
import { toast } from 'sonner';

export function CalendarMain() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<CalendarView>('week');
  const [filters, setFilters] = useState<CalendarFilter>({});
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [newEventDate, setNewEventDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('calendar');

  const { data: events, isLoading } = useCalendarEvents(filters);
  const { createEvent, updateEvent, deleteEvent } = useCalendarMutations();

  // Navigation functions
  const goToPrevious = () => {
    switch (currentView) {
      case 'day':
        setCurrentDate(subDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(subMonths(currentDate, 1));
        break;
    }
  };

  const goToNext = () => {
    switch (currentView) {
      case 'day':
        setCurrentDate(addDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(addMonths(currentDate, 1));
        break;
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Event handlers
  const handleEventClick = (event: CalendarEvent) => {
    setEditingEvent(event);
    setNewEventDate(null);
    setIsEventDialogOpen(true);
  };

  const handleEventCreate = (date?: Date) => {
    setEditingEvent(null);
    setNewEventDate(date || currentDate);
    setIsEventDialogOpen(true);
  };

  const handleEventDelete = async (eventId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      try {
        await deleteEvent.mutateAsync(eventId);
        toast.success('Evento eliminado correctamente');
        setIsEventDialogOpen(false);
        setEditingEvent(null);
      } catch (error) {
        toast.error('Error al eliminar el evento');
      }
    }
  };

  const handleFormSuccess = () => {
    setIsEventDialogOpen(false);
    setEditingEvent(null);
    setNewEventDate(null);
  };

  const getDateRangeText = (): string => {
    switch (currentView) {
      case 'day':
        return format(currentDate, 'd MMMM yyyy', { locale: es });
      case 'week':
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${format(weekStart, 'd MMM', { locale: es })} - ${format(weekEnd, 'd MMM yyyy', { locale: es })}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: es });
      case 'timeline':
        return format(currentDate, 'd MMMM yyyy', { locale: es });
      case 'pipeline':
        return format(currentDate, 'd MMMM yyyy', { locale: es });
      default:
        return '';
    }
  };

  const renderCalendarView = () => {
    const viewProps = {
      events: events || [],
      selectedDate: currentDate,
      onDateChange: setCurrentDate,
      onEventClick: handleEventClick,
      onEventCreate: handleEventCreate,
      loading: isLoading
    };

    switch (currentView) {
      case 'day':
        return <DayView {...viewProps} />;
      case 'week':
        return <WeekView {...viewProps} />;
      case 'month':
        return <MonthView {...viewProps} />;
      case 'timeline':
        return <TimelineView {...viewProps} />;
      case 'pipeline':
        return <PipelineView {...viewProps} />;
      default:
        return <WeekView {...viewProps} />;
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Calendario CRM</h1>
          </div>
          <Badge variant="outline">
            {events?.length || 0} eventos
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hoy
          </Button>
          <Button onClick={() => handleEventCreate()}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Evento
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
          <TabsTrigger value="booking">Enlaces</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="flex-1 space-y-4">
          {/* Calendar Navigation */}
          <Card className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Date Navigation */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goToPrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold min-w-[200px]">
                  {getDateRangeText()}
                </h2>
              </div>

              {/* View Selector */}
              <div className="flex items-center gap-2">
                <Select value={currentView} onValueChange={(value: CalendarView) => setCurrentView(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Día</SelectItem>
                    <SelectItem value="week">Semana</SelectItem>
                    <SelectItem value="month">Mes</SelectItem>
                    <SelectItem value="timeline">Timeline</SelectItem>
                    <SelectItem value="pipeline">Pipeline</SelectItem>
                  </SelectContent>
                </Select>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setFilters({})}>
                      Todos los eventos
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setFilters({ event_type: 'meeting' })}>
                      Solo reuniones
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters({ priority: 'high' })}>
                      Alta prioridad
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters({ status: 'confirmed' })}>
                      Confirmados
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>

          {/* Calendar View */}
          <div className="flex-1">
            {renderCalendarView()}
          </div>
        </TabsContent>

        <TabsContent value="booking" className="flex-1">
          <BookingLinkManager />
        </TabsContent>

        <TabsContent value="analytics" className="flex-1">
          <CalendarAnalytics />
        </TabsContent>

        <TabsContent value="settings" className="flex-1">
          <Card className="p-6">
            <div className="text-center">
              <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Configuración del Calendario</h3>
              <p className="text-muted-foreground">
                La configuración del calendario estará disponible próximamente.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Event Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? 'Editar Evento' : 'Crear Evento'}
            </DialogTitle>
          </DialogHeader>
          <EventForm
            event={editingEvent}
            defaultDate={newEventDate}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsEventDialogOpen(false)}
            onDelete={editingEvent ? () => handleEventDelete(editingEvent.id) : undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}