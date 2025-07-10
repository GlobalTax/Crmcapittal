import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Video, MapPin, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface ScheduleMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunityId: string;
}

const meetingTypes = [
  { value: 'discovery', label: 'Reunión de descubrimiento', icon: Users },
  { value: 'demo', label: 'Demostración', icon: Video },
  { value: 'negotiation', label: 'Negociación', icon: Calendar },
  { value: 'closing', label: 'Cierre', icon: Clock },
];

const durations = [
  { value: '30', label: '30 minutos' },
  { value: '60', label: '1 hora' },
  { value: '90', label: '1.5 horas' },
  { value: '120', label: '2 horas' },
];

export const ScheduleMeetingDialog = ({ 
  open, 
  onOpenChange, 
  opportunityId 
}: ScheduleMeetingDialogProps) => {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    date: '',
    time: '',
    duration: '60',
    location: '',
    attendees: '',
    agenda: '',
    isVirtual: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Aquí iría la lógica para crear la reunión
    toast.success('Reunión programada correctamente', {
      description: `${formData.title} - ${formData.date} a las ${formData.time}`
    });
    
    onOpenChange(false);
    
    // Reset form
    setFormData({
      title: '',
      type: '',
      date: '',
      time: '',
      duration: '60',
      location: '',
      attendees: '',
      agenda: '',
      isVirtual: false,
    });
  };

  const getMeetingTypeIcon = (type: string) => {
    const meetingType = meetingTypes.find(mt => mt.value === type);
    if (!meetingType) return Calendar;
    return meetingType.icon;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Programar reunión
          </DialogTitle>
          <DialogDescription>
            Programa una reunión para esta oportunidad
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título de la reunión</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Reunión de descubrimiento"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de reunión</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  {meetingTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">Hora</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duración</Label>
              <Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durations.map((duration) => (
                    <SelectItem key={duration.value} value={duration.value}>
                      {duration.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ubicación / Enlace</Label>
            <div className="relative">
              {formData.isVirtual ? (
                <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              ) : (
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              )}
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder={formData.isVirtual ? "Enlace de videollamada" : "Dirección de la reunión"}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isVirtual"
                checked={formData.isVirtual}
                onChange={(e) => setFormData({ ...formData, isVirtual: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="isVirtual" className="text-sm">Reunión virtual</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="attendees">Asistentes (emails separados por comas)</Label>
            <div className="relative">
              <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="attendees"
                value={formData.attendees}
                onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                placeholder="email1@empresa.com, email2@empresa.com"
                className="pl-10"
                rows={2}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agenda">Agenda de la reunión</Label>
            <Textarea
              id="agenda"
              value={formData.agenda}
              onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
              placeholder="Puntos a tratar en la reunión..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Programar reunión
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};