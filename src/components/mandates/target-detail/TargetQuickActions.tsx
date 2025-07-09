import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Mail, 
  Phone, 
  Calendar, 
  FileCheck, 
  Brain, 
  MessageSquare,
  Clock,
  User
} from 'lucide-react';
import { MandateTarget } from '@/types/BuyingMandate';
import { useContactHistory } from '@/hooks/useContactHistory';

interface TargetQuickActionsProps {
  target: MandateTarget;
  onAddActivity: (data: any) => void;
  onAddFollowup: (data: any) => void;
  onGenerateNDA: (targetName: string, contactName: string) => void;
  onEnrichWithEInforma: (nif: string) => void;
}

export const TargetQuickActions = ({ 
  target, 
  onAddActivity, 
  onAddFollowup, 
  onGenerateNDA,
  onEnrichWithEInforma 
}: TargetQuickActionsProps) => {
  const [isSchedulingFollowup, setIsSchedulingFollowup] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [emailDisabled, setEmailDisabled] = useState(false);
  const [phoneDisabled, setPhoneDisabled] = useState(false);
  
  const { createContactEntry, hasContactEntry, loading } = useContactHistory();
  
  const [followupData, setFollowupData] = useState({
    title: '',
    description: '',
    scheduled_date: '',
    priority: 'medium',
  });
  const [noteData, setNoteData] = useState({
    title: '',
    description: '',
  });

  // Check if contact entries already exist for this target
  useEffect(() => {
    const checkContactEntries = async () => {
      const hasEmail = await hasContactEntry(target.id, 'email');
      const hasPhone = await hasContactEntry(target.id, 'telefono');
      setEmailDisabled(hasEmail);
      setPhoneDisabled(hasPhone);
    };
    
    checkContactEntries();
  }, [target.id, hasContactEntry]);

  const handleEmailContact = async () => {
    if (target.contact_email && !emailDisabled) {
      // Create contact history entry
      const contactEntry = await createContactEntry(target.id, target.mandate_id, 'email');
      
      if (contactEntry) {
        // Disable the button
        setEmailDisabled(true);
        
        // Open email client
        window.open(`mailto:${target.contact_email}`, '_blank');
        
        // Add activity
        onAddActivity({
          target_id: target.id,
          activity_type: 'email_sent',
          title: 'Email enviado',
          description: `Email enviado a ${target.contact_email}`,
          activity_data: {
            contact_email: target.contact_email,
            contact_name: target.contact_name,
            contact_history_id: contactEntry.id,
          }
        });
      }
    }
  };

  const handlePhoneContact = async () => {
    if (target.contact_phone && !phoneDisabled) {
      // Create contact history entry
      const contactEntry = await createContactEntry(target.id, target.mandate_id, 'telefono');
      
      if (contactEntry) {
        // Disable the button
        setPhoneDisabled(true);
        
        // Open phone dialer
        window.open(`tel:${target.contact_phone}`, '_blank');
        
        // Add activity
        onAddActivity({
          target_id: target.id,
          activity_type: 'contact_made',
          title: 'Llamada realizada',
          description: `Llamada a ${target.contact_phone}`,
          activity_data: {
            contact_phone: target.contact_phone,
            contact_name: target.contact_name,
            contact_method: 'phone',
            contact_history_id: contactEntry.id,
          }
        });
      }
    }
  };

  const handleScheduleFollowup = () => {
    if (followupData.title && followupData.scheduled_date) {
      onAddFollowup({
        target_id: target.id,
        followup_type: 'reminder',
        ...followupData,
      });
      setFollowupData({
        title: '',
        description: '',
        scheduled_date: '',
        priority: 'medium',
      });
      setIsSchedulingFollowup(false);
    }
  };

  const handleAddNote = () => {
    if (noteData.title) {
      onAddActivity({
        target_id: target.id,
        activity_type: 'manual_note',
        ...noteData,
        activity_data: {
          manual: true,
        }
      });
      setNoteData({
        title: '',
        description: '',
      });
      setIsAddingNote(false);
    }
  };

  const handleGenerateNDA = () => {
    onGenerateNDA(target.company_name, target.contact_name || 'Representante legal');
  };

  const handleEnrichWithEInforma = () => {
    // For now, we'll ask for a NIF - in a real app, you might have this stored
    const nif = prompt('Introduce el NIF/CIF de la empresa:');
    if (nif) {
      onEnrichWithEInforma(nif.trim().toUpperCase());
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Acciones Rápidas</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Email Contact */}
        <Button
          variant="outline"
          className="h-auto p-4 flex flex-col items-center gap-2"
          onClick={handleEmailContact}
          disabled={!target.contact_email || emailDisabled || loading}
        >
          <Mail className="h-6 w-6 text-blue-600" />
          <div className="text-center">
            <div className="font-medium">
              {emailDisabled ? 'Email Enviado' : 'Enviar Email'}
            </div>
            <div className="text-xs text-muted-foreground">
              {!target.contact_email 
                ? 'Sin email' 
                : emailDisabled 
                ? 'Ya contactado' 
                : 'Contactar'
              }
            </div>
          </div>
        </Button>

        {/* Phone Contact */}
        <Button
          variant="outline"
          className="h-auto p-4 flex flex-col items-center gap-2"
          onClick={handlePhoneContact}
          disabled={!target.contact_phone || phoneDisabled || loading}
        >
          <Phone className="h-6 w-6 text-green-600" />
          <div className="text-center">
            <div className="font-medium">
              {phoneDisabled ? 'Llamada Hecha' : 'Llamar'}
            </div>
            <div className="text-xs text-muted-foreground">
              {!target.contact_phone 
                ? 'Sin teléfono' 
                : phoneDisabled 
                ? 'Ya contactado' 
                : 'Contactar'
              }
            </div>
          </div>
        </Button>

        {/* Schedule Followup */}
        <Dialog open={isSchedulingFollowup} onOpenChange={setIsSchedulingFollowup}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Calendar className="h-6 w-6 text-purple-600" />
              <div className="text-center">
                <div className="font-medium">Programar</div>
                <div className="text-xs text-muted-foreground">Recordatorio</div>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Programar Recordatorio</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="followup-title">Título</Label>
                <Input
                  id="followup-title"
                  value={followupData.title}
                  onChange={(e) => setFollowupData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Llamada de seguimiento"
                />
              </div>
              
              <div>
                <Label htmlFor="followup-date">Fecha y hora</Label>
                <Input
                  id="followup-date"
                  type="datetime-local"
                  value={followupData.scheduled_date}
                  onChange={(e) => setFollowupData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="followup-description">Descripción (opcional)</Label>
                <Textarea
                  id="followup-description"
                  value={followupData.description}
                  onChange={(e) => setFollowupData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detalles del recordatorio..."
                  rows={3}
                />
              </div>

              <Button onClick={handleScheduleFollowup} className="w-full">
                <Clock className="h-4 w-4 mr-2" />
                Programar Recordatorio
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Note */}
        <Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <MessageSquare className="h-6 w-6 text-orange-600" />
              <div className="text-center">
                <div className="font-medium">Añadir Nota</div>
                <div className="text-xs text-muted-foreground">Comentario</div>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir Nota</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="note-title">Título</Label>
                <Input
                  id="note-title"
                  value={noteData.title}
                  onChange={(e) => setNoteData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Conversación inicial"
                />
              </div>

              <div>
                <Label htmlFor="note-description">Descripción</Label>
                <Textarea
                  id="note-description"
                  value={noteData.description}
                  onChange={(e) => setNoteData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detalles de la nota..."
                  rows={4}
                />
              </div>

              <Button onClick={handleAddNote} className="w-full">
                <User className="h-4 w-4 mr-2" />
                Guardar Nota
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Secondary Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="h-auto p-4 flex items-center gap-3"
          onClick={handleGenerateNDA}
        >
          <FileCheck className="h-5 w-5 text-purple-600" />
          <div className="text-left">
            <div className="font-medium">Generar NDA</div>
            <div className="text-xs text-muted-foreground">
              Crear Acuerdo de Confidencialidad
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto p-4 flex items-center gap-3"
          onClick={handleEnrichWithEInforma}
        >
          <Brain className="h-5 w-5 text-blue-600" />
          <div className="text-left">
            <div className="font-medium">Consultar eInforma</div>
            <div className="text-xs text-muted-foreground">
              Obtener datos oficiales
            </div>
          </div>
        </Button>
      </div>
    </div>
  );
};