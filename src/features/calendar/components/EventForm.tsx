import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateEvent, useUpdateEvent } from '../hooks/useCalendar';
import { CalendarEvent, CreateEventData } from '../types';
import { toast } from 'sonner';

const eventSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  start_date: z.string().min(1, 'La fecha de inicio es requerida'),
  end_date: z.string().min(1, 'La fecha de fin es requerida'),
  event_type: z.enum(['meeting', 'call', 'event', 'deadline', 'reminder']),
  meeting_type: z.enum(['demo', 'follow_up', 'closing', 'negotiation', 'general']).optional(),
  priority: z.enum(['low', 'normal', 'high']).optional(),
  status: z.enum(['draft', 'confirmed', 'cancelled', 'completed']),
  location: z.string().optional(),
  video_meeting_url: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  is_all_day: z.boolean().optional(),
  reminder_minutes: z.number().min(0).optional(),
  travel_time_minutes: z.number().min(0).optional(),
  preparation_notes: z.string().optional(),
  follow_up_required: z.boolean().optional(),
  attendees: z.array(z.object({
    name: z.string(),
    email: z.string().email()
  })).optional(),
  visibility: z.enum(['private', 'public']).optional()
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  event?: CalendarEvent | null;
  defaultDate?: Date | null;
  onSuccess: () => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function EventForm({ event, defaultDate, onSuccess, onCancel, onDelete }: EventFormProps) {
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  const getDefaultStartTime = (): string => {
    const date = defaultDate || new Date();
    const now = new Date();
    
    if (defaultDate) {
      // Si se proporciona una fecha específica, usar las 10:00
      date.setHours(10, 0, 0, 0);
    } else {
      // Si es hoy, redondear a la próxima hora
      date.setMinutes(0, 0, 0);
      if (date <= now) {
        date.setHours(date.getHours() + 1);
      }
    }
    
    return format(date, "yyyy-MM-dd'T'HH:mm");
  };

  const getDefaultEndTime = (): string => {
    const startTime = getDefaultStartTime();
    const endDate = new Date(startTime);
    endDate.setHours(endDate.getHours() + 1);
    return format(endDate, "yyyy-MM-dd'T'HH:mm");
  };

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
      start_date: event?.start_date ? format(new Date(event.start_date), "yyyy-MM-dd'T'HH:mm") : getDefaultStartTime(),
      end_date: event?.end_date ? format(new Date(event.end_date), "yyyy-MM-dd'T'HH:mm") : getDefaultEndTime(),
      event_type: event?.event_type || 'meeting',
      meeting_type: event?.meeting_type || 'general',
      priority: event?.priority || 'normal',
      status: event?.status || 'confirmed',
      location: event?.location || '',
      video_meeting_url: event?.video_meeting_url || '',
      is_all_day: event?.is_all_day || false,
      reminder_minutes: event?.reminder_minutes || 15,
      travel_time_minutes: event?.travel_time_minutes || 0,
      preparation_notes: event?.preparation_notes || '',
      follow_up_required: event?.follow_up_required || false,
      attendees: event?.attendees || [],
      visibility: event?.visibility || 'private'
    }
  });

  const onSubmit = async (data: EventFormData) => {
    try {
      const eventData: CreateEventData = {
        ...data,
        start_date: new Date(data.start_date).toISOString(),
        end_date: new Date(data.end_date).toISOString(),
        attendees: data.attendees || []
      };

      if (event) {
        await updateEvent.mutateAsync({
          id: event.id,
          data: eventData
        });
        toast.success('Evento actualizado correctamente');
      } else {
        await createEvent.mutateAsync(eventData);
        toast.success('Evento creado correctamente');
      }
      onSuccess();
    } catch (error) {
      toast.error(event ? 'Error al actualizar el evento' : 'Error al crear el evento');
    }
  };

  const handleStartDateChange = (startDate: string) => {
    const start = new Date(startDate);
    const currentEnd = new Date(form.getValues('end_date'));
    
    // Si la fecha de fin es anterior a la de inicio, ajustarla
    if (currentEnd <= start) {
      const newEnd = new Date(start);
      newEnd.setHours(newEnd.getHours() + 1);
      form.setValue('end_date', format(newEnd, "yyyy-MM-dd'T'HH:mm"));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Información básica */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Reunión con cliente..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Describe el propósito del evento..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Fecha y hora */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Fecha y Hora</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha y hora de inicio</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        handleStartDateChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha y hora de fin</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="is_all_day"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Todo el día</FormLabel>
                  <FormDescription>
                    Este evento dura todo el día
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Tipo y categoría */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Tipo y Categoría</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="event_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de evento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="meeting">Reunión</SelectItem>
                      <SelectItem value="call">Llamada</SelectItem>
                      <SelectItem value="event">Evento</SelectItem>
                      <SelectItem value="deadline">Fecha límite</SelectItem>
                      <SelectItem value="reminder">Recordatorio</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="meeting_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de reunión</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="demo">Demo</SelectItem>
                      <SelectItem value="follow_up">Seguimiento</SelectItem>
                      <SelectItem value="closing">Cierre</SelectItem>
                      <SelectItem value="negotiation">Negociación</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridad</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona prioridad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="confirmed">Confirmado</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Ubicación */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Ubicación</h3>
          
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ubicación</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Oficina, Zoom, Teams..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="video_meeting_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enlace de videollamada</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://zoom.us/..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Configuración adicional */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Configuración Adicional</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="reminder_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recordatorio (minutos antes)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      value={field.value || ''}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="travel_time_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiempo de viaje (minutos)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      value={field.value || ''}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="preparation_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas de preparación</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Notas para preparar la reunión..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="follow_up_required"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Requiere seguimiento</FormLabel>
                  <FormDescription>
                    Crear tarea de seguimiento automáticamente
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <div>
            {onDelete && (
              <Button type="button" variant="destructive" onClick={onDelete}>
                Eliminar
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createEvent.isPending || updateEvent.isPending}
            >
              {event ? 'Actualizar' : 'Crear'} Evento
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}