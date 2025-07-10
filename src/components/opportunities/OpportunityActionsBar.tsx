import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Mail, Phone, Video, Plus, FileText, Clock } from 'lucide-react';
import { ScheduleMeetingDialog } from './ScheduleMeetingDialog';
import { toast } from 'sonner';

interface OpportunityActionsBarProps {
  opportunityId: string;
}

export const OpportunityActionsBar = ({ opportunityId }: OpportunityActionsBarProps) => {
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'email':
        toast.info('Composer de email se abriría aquí');
        break;
      case 'call':
        toast.info('Función de llamada se abriría aquí');
        break;
      case 'note':
        toast.info('Editor de notas se abriría aquí');
        break;
      case 'task':
        toast.info('Creador de tareas se abriría aquí');
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-muted/50 rounded-lg">
      <Button
        onClick={() => setMeetingDialogOpen(true)}
        className="flex items-center gap-2"
      >
        <Calendar className="h-4 w-4" />
        Programar reunión
      </Button>
      
      <Button
        variant="outline"
        onClick={() => handleQuickAction('email')}
        className="flex items-center gap-2"
      >
        <Mail className="h-4 w-4" />
        Enviar email
      </Button>
      
      <Button
        variant="outline"
        onClick={() => handleQuickAction('call')}
        className="flex items-center gap-2"
      >
        <Phone className="h-4 w-4" />
        Llamar
      </Button>
      
      <Button
        variant="outline"
        onClick={() => handleQuickAction('note')}
        className="flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        Añadir nota
      </Button>
      
      <Button
        variant="outline"
        onClick={() => handleQuickAction('task')}
        className="flex items-center gap-2"
      >
        <Clock className="h-4 w-4" />
        Crear tarea
      </Button>

      <ScheduleMeetingDialog
        open={meetingDialogOpen}
        onOpenChange={setMeetingDialogOpen}
        opportunityId={opportunityId}
      />
    </div>
  );
};