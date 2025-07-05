import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Phone, Mail, MessageSquare, Calendar as CalendarIconLucide, Users, Target } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Contact } from "@/types/Contact";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact;
  onActivityAdded: () => void;
}

const ACTIVITY_TYPES = [
  { value: 'call_logged', label: 'Llamada', icon: Phone, description: 'Registrar una llamada telefónica' },
  { value: 'email_sent', label: 'Email enviado', icon: Mail, description: 'Registrar un email enviado' },
  { value: 'meeting_scheduled', label: 'Reunión programada', icon: CalendarIconLucide, description: 'Programar o registrar una reunión' },
  { value: 'note_added', label: 'Nota', icon: MessageSquare, description: 'Añadir una nota o comentario' },
  { value: 'interaction_logged', label: 'Interacción general', icon: Users, description: 'Registrar cualquier tipo de interacción' },
  { value: 'manual_activity', label: 'Actividad personalizada', icon: Target, description: 'Crear una actividad personalizada' }
];

const INTERACTION_METHODS = [
  { value: 'phone', label: 'Teléfono' },
  { value: 'email', label: 'Email' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'meeting', label: 'Reunión presencial' },
  { value: 'video_call', label: 'Videollamada' },
  { value: 'other', label: 'Otro' }
];

const CALL_OUTCOMES = [
  { value: 'successful', label: 'Exitosa' },
  { value: 'no_answer', label: 'No contestó' },
  { value: 'voicemail', label: 'Buzón de voz' },
  { value: 'busy', label: 'Ocupado' },
  { value: 'callback_requested', label: 'Solicita devolución' },
  { value: 'not_interested', label: 'No interesado' },
  { value: 'interested', label: 'Interesado' }
];

export function AddActivityDialog({ open, onOpenChange, contact, onActivityAdded }: AddActivityDialogProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    activity_type: '',
    title: '',
    description: '',
    interaction_method: '',
    duration_minutes: '',
    outcome: '',
    next_action: '',
    activity_date: new Date(),
    attendees: '',
    location: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const selectedActivityType = ACTIVITY_TYPES.find(type => type.value === formData.activity_type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.activity_type || !formData.title) return;

    setIsLoading(true);
    try {
      // Create activity data based on type
      const activityData: Record<string, any> = {
        activity_date: formData.activity_date.toISOString()
      };

      if (formData.interaction_method) {
        activityData.interaction_method = formData.interaction_method;
      }
      if (formData.duration_minutes) {
        activityData.duration_minutes = parseInt(formData.duration_minutes);
      }
      if (formData.outcome) {
        activityData.outcome = formData.outcome;
      }
      if (formData.next_action) {
        activityData.next_action = formData.next_action;
      }
      if (formData.attendees) {
        activityData.attendees = formData.attendees.split(',').map(s => s.trim());
      }
      if (formData.location) {
        activityData.location = formData.location;
      }

      // Insert activity
      const { error: activityError } = await supabase
        .from('contact_activities')
        .insert({
          contact_id: contact.id,
          activity_type: formData.activity_type,
          title: formData.title,
          description: formData.description || null,
          activity_data: activityData,
          created_by: user.id
        });

      if (activityError) throw activityError;

      // If it's a note, also create it in contact_notes table
      if (formData.activity_type === 'note_added') {
        const { error: noteError } = await supabase
          .from('contact_notes')
          .insert({
            contact_id: contact.id,
            note: formData.description,
            note_type: 'manual',
            created_by: user.id
          });

        if (noteError) throw noteError;
      }

      // If it's an interaction, also create it in contact_interactions table
      if (formData.activity_type === 'interaction_logged') {
        const { error: interactionError } = await supabase
          .from('contact_interactions')
          .insert({
            contact_id: contact.id,
            interaction_type: 'manual',
            interaction_method: formData.interaction_method || 'other',
            subject: formData.title,
            description: formData.description,
            interaction_date: formData.activity_date.toISOString(),
            duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
            outcome: formData.outcome || null,
            next_action: formData.next_action || null,
            location: formData.location || null,
            created_by: user.id
          });

        if (interactionError) throw interactionError;
      }

      toast.success('Actividad añadida correctamente');
      onActivityAdded();
      resetForm();
    } catch (error) {
      console.error('Error adding activity:', error);
      toast.error('Error al añadir la actividad');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      activity_type: '',
      title: '',
      description: '',
      interaction_method: '',
      duration_minutes: '',
      outcome: '',
      next_action: '',
      activity_date: new Date(),
      attendees: '',
      location: ''
    });
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Añadir Actividad - {contact.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Activity Type Selection */}
          <div className="space-y-2">
            <Label>Tipo de Actividad</Label>
            <div className="grid grid-cols-2 gap-2">
              {ACTIVITY_TYPES.map((type) => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => updateFormData('activity_type', type.value)}
                    className={`p-3 border rounded-lg text-left hover:bg-muted transition-colors ${
                      formData.activity_type === type.value ? 'border-primary bg-primary/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <IconComponent className="h-4 w-4" />
                      <span className="font-medium text-sm">{type.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {formData.activity_type && (
            <>
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder={selectedActivityType ? `${selectedActivityType.label} con ${contact.name}` : 'Título de la actividad'}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Detalles de la actividad..."
                  rows={3}
                />
              </div>

              {/* Activity Date */}
              <div className="space-y-2">
                <Label>Fecha de la Actividad</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formData.activity_date, "PPP", { locale: es })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.activity_date}
                      onSelect={(date) => date && updateFormData('activity_date', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Interaction Method (for calls, interactions) */}
              {['call_logged', 'interaction_logged'].includes(formData.activity_type) && (
                <div className="space-y-2">
                  <Label>Método de Contacto</Label>
                  <Select value={formData.interaction_method} onValueChange={(value) => updateFormData('interaction_method', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar método" />
                    </SelectTrigger>
                    <SelectContent>
                      {INTERACTION_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Duration (for calls, meetings) */}
              {['call_logged', 'meeting_scheduled', 'interaction_logged'].includes(formData.activity_type) && (
                <div className="space-y-2">
                  <Label htmlFor="duration">Duración (minutos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => updateFormData('duration_minutes', e.target.value)}
                    placeholder="30"
                  />
                </div>
              )}

              {/* Outcome (for calls) */}
              {formData.activity_type === 'call_logged' && (
                <div className="space-y-2">
                  <Label>Resultado de la Llamada</Label>
                  <Select value={formData.outcome} onValueChange={(value) => updateFormData('outcome', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar resultado" />
                    </SelectTrigger>
                    <SelectContent>
                      {CALL_OUTCOMES.map((outcome) => (
                        <SelectItem key={outcome.value} value={outcome.value}>
                          {outcome.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Location (for meetings) */}
              {formData.activity_type === 'meeting_scheduled' && (
                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => updateFormData('location', e.target.value)}
                    placeholder="Oficina, Zoom, Teams..."
                  />
                </div>
              )}

              {/* Attendees (for meetings) */}
              {formData.activity_type === 'meeting_scheduled' && (
                <div className="space-y-2">
                  <Label htmlFor="attendees">Asistentes</Label>
                  <Input
                    id="attendees"
                    value={formData.attendees}
                    onChange={(e) => updateFormData('attendees', e.target.value)}
                    placeholder="Separar con comas: Juan Pérez, María García..."
                  />
                </div>
              )}

              {/* Next Action */}
              <div className="space-y-2">
                <Label htmlFor="nextAction">Próxima Acción</Label>
                <Input
                  id="nextAction"
                  value={formData.next_action}
                  onChange={(e) => updateFormData('next_action', e.target.value)}
                  placeholder="Enviar propuesta, agendar reunión..."
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!formData.activity_type || !formData.title || isLoading}
            >
              {isLoading ? 'Guardando...' : 'Añadir Actividad'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}