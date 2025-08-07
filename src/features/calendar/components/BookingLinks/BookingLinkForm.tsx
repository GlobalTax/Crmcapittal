import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
import { useCreateBookingLink, useUpdateBookingLink } from '../../hooks/useBookingLinks';
import { BookingLink, CreateBookingLinkData } from '../../types';
import { toast } from 'sonner';

const bookingLinkSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  slug: z.string().min(1, 'El slug es requerido').regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  duration_minutes: z.number().min(15, 'Mínimo 15 minutos').max(480, 'Máximo 8 horas'),
  buffer_time_before: z.number().min(0, 'Debe ser 0 o mayor').optional(),
  buffer_time_after: z.number().min(0, 'Debe ser 0 o mayor').optional(),
  advance_notice_hours: z.number().min(1, 'Mínimo 1 hora').optional(),
  max_advance_days: z.number().min(1, 'Mínimo 1 día').optional(),
  meeting_location: z.string().optional(),
  video_meeting_enabled: z.boolean().optional(),
  requires_approval: z.boolean().optional(),
  booking_limit_per_day: z.number().min(1, 'Mínimo 1').optional().nullable(),
  is_active: z.boolean().optional(),
  confirmation_message: z.string().optional(),
  redirect_url: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  availability_schedule: z.object({
    monday: z.array(z.object({
      start: z.string(),
      end: z.string()
    })).optional(),
    tuesday: z.array(z.object({
      start: z.string(),
      end: z.string()
    })).optional(),
    wednesday: z.array(z.object({
      start: z.string(),
      end: z.string()
    })).optional(),
    thursday: z.array(z.object({
      start: z.string(),
      end: z.string()
    })).optional(),
    friday: z.array(z.object({
      start: z.string(),
      end: z.string()
    })).optional(),
    saturday: z.array(z.object({
      start: z.string(),
      end: z.string()
    })).optional(),
    sunday: z.array(z.object({
      start: z.string(),
      end: z.string()
    })).optional(),
  }),
  questions: z.array(z.object({
    id: z.string().optional(),
    question: z.string().optional(),
    type: z.enum(['text', 'email', 'phone', 'select', 'textarea']).optional(),
    required: z.boolean().optional(),
    options: z.array(z.string()).optional()
  })).optional()
});

type BookingLinkFormData = z.infer<typeof bookingLinkSchema>;

interface BookingLinkFormProps {
  link?: BookingLink | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BookingLinkForm({ link, onSuccess, onCancel }: BookingLinkFormProps) {
  const createBookingLink = useCreateBookingLink();
  const updateBookingLink = useUpdateBookingLink();

  const form = useForm<BookingLinkFormData>({
    resolver: zodResolver(bookingLinkSchema),
    defaultValues: {
      title: link?.title || '',
      description: link?.description || '',
      slug: link?.slug || '',
      duration_minutes: link?.duration_minutes || 30,
      buffer_time_before: link?.buffer_time_before || 0,
      buffer_time_after: link?.buffer_time_after || 0,
      advance_notice_hours: link?.advance_notice_hours || 2,
      max_advance_days: link?.max_advance_days || 60,
      meeting_location: link?.meeting_location || '',
      video_meeting_enabled: link?.video_meeting_enabled ?? true,
      requires_approval: link?.requires_approval || false,
      booking_limit_per_day: link?.booking_limit_per_day || null,
      is_active: link?.is_active ?? true,
      confirmation_message: link?.confirmation_message || '',
      redirect_url: link?.redirect_url || '',
      availability_schedule: link?.availability_schedule || {
        monday: [{ start: '09:00', end: '17:00' }],
        tuesday: [{ start: '09:00', end: '17:00' }],
        wednesday: [{ start: '09:00', end: '17:00' }],
        thursday: [{ start: '09:00', end: '17:00' }],
        friday: [{ start: '09:00', end: '17:00' }],
        saturday: [],
        sunday: [],
        timezone: 'Europe/Madrid'
      },
      questions: link?.questions || []
    }
  });

  const onSubmit = async (data: BookingLinkFormData) => {
    try {
      if (link) {
        await updateBookingLink.mutateAsync({
          id: link.id,
          ...data
        });
        toast.success('Enlace actualizado correctamente');
      } else {
        await createBookingLink.mutateAsync(data as CreateBookingLinkData);
        toast.success('Enlace creado correctamente');
      }
      onSuccess();
    } catch (error) {
      toast.error(link ? 'Error al actualizar el enlace' : 'Error al crear el enlace');
    }
  };

  const generateSlug = () => {
    const title = form.getValues('title');
    if (title) {
      const slug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
      form.setValue('slug', slug);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Información básica */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Información Básica</h3>
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Reunión de 30 minutos" onBlur={generateSlug} />
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
                  <Textarea {...field} placeholder="Describe qué incluye esta reunión..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL del enlace</FormLabel>
                <FormControl>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-muted-foreground bg-muted border border-r-0 border-input rounded-l-md">
                      {window.location.origin}/booking/
                    </span>
                    <Input {...field} className="rounded-l-none" placeholder="mi-reunion" />
                  </div>
                </FormControl>
                <FormDescription>
                  Solo letras minúsculas, números y guiones
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Configuración de tiempo */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Configuración de Tiempo</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="duration_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duración (minutos)</FormLabel>
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
              name="advance_notice_hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aviso previo (horas)</FormLabel>
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

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="buffer_time_before"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buffer antes (min)</FormLabel>
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
              name="buffer_time_after"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buffer después (min)</FormLabel>
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
        </div>

        {/* Configuración */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Configuración</h3>
          
          <FormField
            control={form.control}
            name="meeting_location"
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

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="video_meeting_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Videollamada</FormLabel>
                    <FormDescription>
                      Generar enlace automático
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requires_approval"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Requiere aprobación</FormLabel>
                    <FormDescription>
                      Aprobar manualmente
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Enlace activo</FormLabel>
                  <FormDescription>
                    Los usuarios pueden hacer reservas
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
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={createBookingLink.isPending || updateBookingLink.isPending}
          >
            {link ? 'Actualizar' : 'Crear'} Enlace
          </Button>
        </div>
      </form>
    </Form>
  );
}