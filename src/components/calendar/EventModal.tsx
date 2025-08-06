import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon, Clock, MapPin, Users, Building, Target } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarEvent } from '@/hooks/useCalendarEvents';
import { CreateEventData, useCalendarMutations } from '@/hooks/useCalendarMutations';
import { useLeadsForSelection } from '@/hooks/useLeadsForSelection';
import { useMandatesForSelection } from '@/hooks/useMandatesForSelection';
import { cn } from '@/lib/utils';

interface EventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEvent | null;
  onEventSaved?: () => void;
  defaultDate?: Date;
}

export const EventModal = ({ open, onOpenChange, event, onEventSaved, defaultDate }: EventModalProps) => {
  const { createEvent, updateEvent, loading } = useCalendarMutations();
  const { leads, loading: leadsLoading } = useLeadsForSelection();
  const { mandates, loading: mandatesLoading } = useMandatesForSelection();
  const [startDate, setStartDate] = useState<Date | undefined>(defaultDate || new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(defaultDate || new Date());
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<CreateEventData>({
    defaultValues: {
      title: '',
      description: '',
      location: '',
      event_type: 'meeting',
      status: 'confirmed',
      lead_id: null,
      mandate_id: null
    }
  });

  const eventType = watch('event_type');
  const leadId = watch('lead_id');
  const mandateId = watch('mandate_id');

  useEffect(() => {
    if (event) {
      // Edit mode
      setValue('title', event.title);
      setValue('description', event.description || '');
      setValue('location', event.location || '');
      setValue('event_type', event.event_type);
      setValue('status', event.status);
      setValue('lead_id', event.lead_id || null);
      setValue('mandate_id', event.mandate_id || null);
      setStartDate(new Date(event.start_date));
      setEndDate(new Date(event.end_date));
    } else {
      // Create mode
      reset();
      const now = defaultDate || new Date();
      const later = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
      setStartDate(now);
      setEndDate(later);
    }
  }, [event, defaultDate, setValue, reset]);

  const onSubmit = async (data: CreateEventData) => {
    if (!startDate || !endDate) return;

    const eventData = {
      ...data,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    };

    let success = false;
    if (event) {
      success = await updateEvent(event.id, eventData) !== null;
    } else {
      success = await createEvent(eventData) !== null;
    }

    if (success) {
      onOpenChange(false);
      onEventSaved?.();
      reset();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {event ? 'Editar Evento' : 'Nuevo Evento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              {...register('title', { required: 'El título es obligatorio' })}
              placeholder="Título del evento"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="event_type">Tipo de evento</Label>
            <Select onValueChange={(value) => setValue('event_type', value as any)} defaultValue={eventType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meeting">🤝 Reunión</SelectItem>
                <SelectItem value="call">📞 Llamada</SelectItem>
                <SelectItem value="task">✅ Tarea</SelectItem>
                <SelectItem value="appointment">📅 Cita</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lead_selection">
                <Building className="inline h-4 w-4 mr-1" />
                Lead relacionado
              </Label>
              <Select 
                value={leadId || ''} 
                onValueChange={(value) => {
                  setValue('lead_id', value || null);
                  if (value) setValue('mandate_id', null); // Clear mandate if lead is selected
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar lead" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin lead</SelectItem>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.name} {lead.company_name && `(${lead.company_name})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mandate_selection">
                <Target className="inline h-4 w-4 mr-1" />
                Mandato relacionado
              </Label>
              <Select 
                value={mandateId || ''} 
                onValueChange={(value) => {
                  setValue('mandate_id', value || null);
                  if (value) setValue('lead_id', null); // Clear lead if mandate is selected
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar mandato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin mandato</SelectItem>
                  {mandates.map((mandate) => (
                    <SelectItem key={mandate.id} value={mandate.id}>
                      {mandate.mandate_name} ({mandate.client_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha y hora inicio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                value={startDate ? format(startDate, "HH:mm") : ""}
                onChange={(e) => {
                  if (startDate && e.target.value) {
                    const [hours, minutes] = e.target.value.split(':');
                    const newDate = new Date(startDate);
                    newDate.setHours(parseInt(hours), parseInt(minutes));
                    setStartDate(newDate);
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Fecha y hora fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                value={endDate ? format(endDate, "HH:mm") : ""}
                onChange={(e) => {
                  if (endDate && e.target.value) {
                    const [hours, minutes] = e.target.value.split(':');
                    const newDate = new Date(endDate);
                    newDate.setHours(parseInt(hours), parseInt(minutes));
                    setEndDate(newDate);
                  }
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">
              <MapPin className="inline h-4 w-4 mr-1" />
              Ubicación
            </Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="Ubicación del evento"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descripción del evento"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : (event ? 'Actualizar' : 'Crear Evento')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};