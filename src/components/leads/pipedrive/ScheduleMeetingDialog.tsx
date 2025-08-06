import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ScheduleMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
}

export const ScheduleMeetingDialog = ({ open, onOpenChange, leadId }: ScheduleMeetingDialogProps) => {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [meetingType, setMeetingType] = useState('presencial');
  const [location, setLocation] = useState('');
  
  const queryClient = useQueryClient();
  
  const scheduleMeetingMutation = useMutation({
    mutationFn: async () => {
      if (!date || !time || !title) {
        throw new Error('Todos los campos obligatorios deben estar completos');
      }
      
      const meetingDateTime = new Date(date);
      const [hours, minutes] = time.split(':');
      meetingDateTime.setHours(parseInt(hours), parseInt(minutes));
      
      // Update lead with next activity date
      const { error: leadError } = await supabase
        .from('leads')
        .update({ next_activity_date: meetingDateTime.toISOString() })
        .eq('id', leadId);
      
      if (leadError) throw leadError;
      
      // Create activity record
      const { error: activityError } = await supabase
        .from('lead_activities')
        .insert({
          lead_id: leadId,
          activity_type: 'MEETING_SCHEDULED',
          activity_data: {
            title,
            description,
            meeting_type: meetingType,
            location,
            scheduled_date: meetingDateTime.toISOString(),
          },
          points_awarded: 15
        });
      
      if (activityError) throw activityError;
      
      return { meetingDateTime };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities', leadId] });
      toast.success('Reunión programada exitosamente');
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al programar la reunión');
    },
  });
  
  const resetForm = () => {
    setDate(undefined);
    setTime('');
    setTitle('');
    setDescription('');
    setMeetingType('presencial');
    setLocation('');
  };
  
  const handleSubmit = () => {
    scheduleMeetingMutation.mutate();
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Programar Reunión</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título de la reunión *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Reunión comercial inicial"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Fecha *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="time">Hora *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="meetingType">Tipo de reunión</Label>
            <Select value={meetingType} onValueChange={setMeetingType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="presencial">Presencial</SelectItem>
                <SelectItem value="virtual">Virtual</SelectItem>
                <SelectItem value="telefonica">Telefónica</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="location">
              {meetingType === 'virtual' ? 'Enlace de la reunión' : 'Ubicación'}
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={
                meetingType === 'virtual' 
                  ? "https://meet.google.com/..." 
                  : "Dirección de la reunión"
              }
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Agenda y objetivos de la reunión..."
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={scheduleMeetingMutation.isPending}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={scheduleMeetingMutation.isPending || !date || !time || !title}
          >
            {scheduleMeetingMutation.isPending ? 'Programando...' : 'Programar Reunión'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};